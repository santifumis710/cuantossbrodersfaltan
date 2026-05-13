'use client';

import { useState, useRef, useEffect } from 'react';

export default function PhotoUpload({ onUploadSuccess }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [tuesdayNumber, setTuesdayNumber] = useState('');
  const [tuesdayOptions, setTuesdayOptions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Calculate tuesday options client-side
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
      .reverse(); // Most recent first

    setTuesdayOptions(options);
    if (options.length > 0) {
      setTuesdayNumber(options[0].value.toString());
    }
  }, []);

  const handleUploadClick = () => {
    setShowPasswordModal(true);
    setError('');
    setPassword('');
  };

  const handlePasswordSubmit = () => {
    if (password === 'sanfrancisco2026' || password === (typeof window !== 'undefined' ? '' : '')) {
      setShowPasswordModal(false);
      setShowUploadModal(true);
      setError('');
    } else {
      // We'll validate server-side, but give quick client feedback for known password
      // Actually let's just move to upload and let server validate
      setShowPasswordModal(false);
      setShowUploadModal(true);
      setError('');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !tuesdayNumber) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);
      formData.append('tuesdayNumber', tuesdayNumber);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al subir la foto');
        setUploading(false);
        return;
      }

      // Success
      setShowUploadModal(false);
      resetForm();
      onUploadSuccess?.();
    } catch (err) {
      setError('Error de conexión. Intentá de nuevo.');
    }

    setUploading(false);
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setPassword('');
    setError('');
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
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                autoFocus
              />
            </div>

            {error && <div className="modal__error">{error}</div>}

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
        <div className="modal-overlay" onClick={closeAll}>
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

                {error && <div className="modal__error">{error}</div>}

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
