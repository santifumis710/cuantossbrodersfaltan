'use client';

import { useState } from 'react';
import Counter from '@/components/Counter';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoGallery from '@/components/PhotoGallery';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="main-container">
      <header className="header animate-in">
        <span className="header__emoji">🍺</span>
        <h1 className="header__title">Broders</h1>
        <p className="header__subtitle">Todos los martes, como debe ser</p>
      </header>

      <Counter />
      <PhotoUpload onUploadSuccess={handleUploadSuccess} />
      <PhotoGallery refreshKey={refreshKey} />
    </main>
  );
}
