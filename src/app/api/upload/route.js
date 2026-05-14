import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

const PASSWORD = process.env.UPLOAD_PASSWORD || 'sanfrancisco2026';

export async function POST(request) {
  // Check if BLOB token is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Falta configurar BLOB_READ_WRITE_TOKEN en Vercel.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const password = formData.get('password');
    const tuesdayNumber = formData.get('tuesdayNumber');

    // Validate password
    if (!password || password !== PASSWORD) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta ❌' },
        { status: 401 }
      );
    }

    // Validate file
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'No se recibió ningún archivo' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Usá JPG, PNG o WebP.' },
        { status: 400 }
      );
    }

    // Build pathname
    const timestamp = Date.now();
    const ext = file.name?.split('.').pop() || 'jpg';
    const pathname = `broders/martes-${tuesdayNumber || '0'}/${timestamp}.${ext}`;

    // Upload to Vercel Blob using server upload (put)
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al subir la foto' },
      { status: 500 }
    );
  }
}
