'use client';

import { useState, useRef, useEffect } from 'react';

const PASSWORD = 'sf26';

// Compress image in the browser using Canvas API
// This ensures we stay under the 4.5MB serverless body limit
async function compressImage(file, maxWidth = 1920, initialQuality = 0.8) {
  // If file is already very small (< 500KB) and is a web-friendly format, skip
  if (file.size < 500 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Scale down if wider than maxWidth
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Try to compress iteratively until under 3.5MB
      const MAX_SIZE = 3.5 * 1024 * 1024;
      let quality = initialQuality;
      let blob = null;

      const tryCompress = (q) =>
        new Promise((res) => {
          canvas.toBlob((b) => res(b), 'image/jpeg', q);
        });

      // Try up to 4 times with decreasing quality
      for (const q of [quality, 0.6, 0.4, 0.25]) {
        blob = await tryCompress(q);
        if (blob && blob.size <= MAX_SIZE) break;
      }

      if (!blob) {
        // Last resort: use whatever we got
        blob = await tryCompress(0.2);
      }

      if (blob) {
        const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      } else {
        // If compression totally fails, send original
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      // If we can't compress, just use the original
      resolve(file);
    };

    img.src = url;
  });
}

export default function PhotoUpload({ onUploadSuccess }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tuesdayNumber, setTuesdayNumber] = useState('');
  const [tuesdayOptions, setTuesdayOptions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const FIRST_TUESDAY = new Date(2026, 2, 10);
    const LAST_TUESDAY = new Date(2026, 11, 1);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const tuesdays = [];
    const current = new Date(FIRST_TUESDAY);
    while (current <= LAST_TUESDAY) {
      tuesdays.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const options = tuesdays
      .filter(t => t <= today)
      .map((t, i) => ({
        value: i + 1,
        label: `Martes #${i + 1} - ${t.getDate()} de ${months[t.getMonth()]}`,
      }))
      .reverse();

    setTuesdayOptions(options);
    if (options.length > 0) {
      setTuesdayNumber(options[0].value.toString());
    }
  }, []);

  const handleUploadClick = () => {
    setShowPasswordModal(true);
    setPasswordError('');
    setPassword('');
  };

  // Validate password immediately in the password modal
  const handlePasswordSubmit = () => {
    if (!password) {
      setPasswordError('Ingresá la contraseña');
      return;
    }
    if (password !== PASSWORD) {
      setPasswordError('Contraseña incorrecta ❌');
      return;
    }
    // Correct password
    setShowPasswordModal(false);
    setShowUploadModal(true);
    setUploadError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !tuesdayNumber) return;

    setUploading(true);
    setUploadError('');

    try {
      // Compress image in browser before uploading
      const compressedFile = await compressImage(file);

      // Build FormData
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('password', password);
      formData.append('tuesdayNumber', tuesdayNumber);

      // Upload via our API route (server upload to Blob)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la foto');
      }

      setShowUploadModal(false);
      resetForm();
      onUploadSuccess?.();
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Error al subir la foto. Intentá de nuevo.');
    }

    setUploading(false);
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setPassword('');
    setPasswordError('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeAll = () => {
    setShowPasswordModal(false);
    setShowUploadModal(false);
    resetForm();
  };

  return (
    <>
      <div className="upload-section animate-in-delay-2">
        <button className="upload-btn" onClick={handleUploadClick} id="upload-button">
          <span className="upload-btn__icon">📸</span>
          Subir foto del Broders
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={closeAll}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__title">🔒 Contraseña</div>
            <div className="modal__subtitle">Ingresá la contraseña para subir fotos</div>

            <div className="modal__field">
              <label className="modal__label" htmlFor="password-input">Contraseña</label>
              <input
                id="password-input"
                type="password"
                className="modal__input"
                placeholder="Ingresá la contraseña..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(''); // clear error on typing
                }}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                autoFocus
              />
              {passwordError && <div className="modal__error">{passwordError}</div>}
            </div>

            <div className="modal__actions">
              <button className="modal__btn modal__btn--cancel" onClick={closeAll}>
                Cancelar
              </button>
              <button
                className="modal__btn modal__btn--submit"
                onClick={handlePasswordSubmit}
                disabled={!password}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={!uploading ? closeAll : undefined}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {uploading ? (
              <div className="modal__uploading">
                <div className="modal__spinner" />
                Subiendo foto...
              </div>
            ) : (
              <>
                <div className="modal__title">📸 Subir foto</div>
                <div className="modal__subtitle">Elegí la foto y a qué martes pertenece</div>

                <div className="modal__field">
                  <label className="modal__label">Foto</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="modal__file-input"
                    onChange={handleFileChange}
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className={`modal__file-label ${file ? 'modal__file-label--has-file' : ''}`}
                  >
                    {preview ? (
                      <img src={preview} alt="Preview" className="modal__preview" />
                    ) : (
                      <>
                        <span className="modal__file-icon">🖼️</span>
                        <span className="modal__file-text">Tocá para elegir una foto</span>
                      </>
                    )}
                  </label>
                  {file && (
                    <div className="modal__file-name">{file.name}</div>
                  )}
                </div>

                <div className="modal__field">
                  <label className="modal__label" htmlFor="tuesday-select">¿De qué martes es?</label>
                  <select
                    id="tuesday-select"
                    className="modal__select"
                    value={tuesdayNumber}
                    onChange={(e) => setTuesdayNumber(e.target.value)}
                  >
                    {tuesdayOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {uploadError && <div className="modal__error">{uploadError}</div>}

                <div className="modal__actions">
                  <button className="modal__btn modal__btn--cancel" onClick={closeAll}>
                    Cancelar
                  </button>
                  <button
                    className="modal__btn modal__btn--submit"
                    onClick={handleSubmit}
                    disabled={!file || !tuesdayNumber}
                  >
                    Subir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
