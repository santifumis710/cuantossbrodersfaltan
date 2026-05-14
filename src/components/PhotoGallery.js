'use client';

import { useState, useEffect, useCallback } from 'react';

export default function PhotoGallery({ refreshKey }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await fetch('/api/photos');
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (err) {
      console.error('Error fetching photos:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos, refreshKey]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteTarget || !deletePassword) return;

    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: deleteTarget.blobUrl || deleteTarget.url,
          password: deletePassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteError(data.error || 'Error al borrar');
        setDeleting(false);
        return;
      }

      setDeleteTarget(null);
      setDeletePassword('');
      showToast('Foto borrada correctamente');
      fetchPhotos();
    } catch (err) {
      setDeleteError('Error de conexión');
    }

    setDeleting(false);
  };

  // Group photos by tuesday number
  const groupedPhotos = photos.reduce((groups, photo) => {
    const key = photo.tuesdayNumber;
    if (!groups[key]) groups[key] = [];
    groups[key].push(photo);
    return groups;
  }, {});

  const sortedGroups = Object.keys(groupedPhotos)
    .sort((a, b) => parseInt(b) - parseInt(a));

  // Get formatted tuesday label
  const getTuesdayLabel = (num) => {
    const FIRST_TUESDAY = new Date(2026, 2, 10);
    const date = new Date(FIRST_TUESDAY);
    date.setDate(date.getDate() + (parseInt(num) - 1) * 7);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `Martes #${num} — ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading__spinner" />
        <div>Cargando fotos...</div>
      </div>
    );
  }

  return (
    <>
      <section className="gallery animate-in-delay-3">
        <h2 className="gallery__title">
          <span className="gallery__title-icon">📷</span>
          Galería Broders
        </h2>

        {photos.length === 0 ? (
          <div className="gallery__empty">
            <span className="gallery__empty-icon">🍺</span>
            Todavía no hay fotos.<br />
            ¡Subí la primera!
          </div>
        ) : (
          sortedGroups.map((tuesdayNum) => (
            <div key={tuesdayNum} className="gallery__group">
              <div className="gallery__group-header">
                <span className="gallery__group-emoji">🍻</span>
                {getTuesdayLabel(tuesdayNum)}
              </div>
              <div className="gallery__grid">
                {groupedPhotos[tuesdayNum].map((photo, idx) => (
                  <div key={photo.url} className="gallery__item">
                    <img
                      src={photo.url}
                      alt={`Broders martes ${tuesdayNum}`}
                      loading="lazy"
                      onClick={() => setViewerPhoto(photo)}
                    />
                    <button
                      className="gallery__item-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(photo);
                        setDeletePassword('');
                        setDeleteError('');
                      }}
                      aria-label="Borrar foto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Photo Viewer */}
      {viewerPhoto && (
        <div className="viewer-overlay" onClick={() => setViewerPhoto(null)}>
          <button className="viewer-close" onClick={() => setViewerPhoto(null)}>✕</button>
          <img
            src={viewerPhoto.url}
            alt="Foto ampliada"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {deleting ? (
              <div className="modal__uploading">
                <div className="modal__spinner" />
                Borrando foto...
              </div>
            ) : (
              <div className="delete-confirm">
                <div className="delete-confirm__icon">🗑️</div>
                <div className="modal__title">¿Borrar esta foto?</div>
                <div className="delete-confirm__text">
                  Esta acción no se puede deshacer
                </div>

                <div className="modal__field">
                  <label className="modal__label" htmlFor="delete-password">Contraseña</label>
                  <input
                    id="delete-password"
                    type="password"
                    className="modal__input"
                    placeholder="Ingresá la contraseña..."
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                    autoFocus
                  />
                </div>

                {deleteError && <div className="modal__error">{deleteError}</div>}

                <div className="modal__actions">
                  <button
                    className="modal__btn modal__btn--cancel"
                    onClick={() => setDeleteTarget(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="modal__btn modal__btn--submit"
                    onClick={handleDelete}
                    disabled={!deletePassword}
                    style={{ background: 'linear-gradient(135deg, #991b1b, #dc2626)' }}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
