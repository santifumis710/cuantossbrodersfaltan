import { put, list } from '@vercel/blob';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

const PASSWORD = process.env.UPLOAD_PASSWORD || 'sanfrancisco2026';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const password = formData.get('password');
    const tuesdayNumber = formData.get('tuesdayNumber');

    if (!password || password !== PASSWORD) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    if (!tuesdayNumber) {
      return NextResponse.json({ error: 'Seleccioná a qué martes pertenece la foto' }, { status: 400 });
    }

    // Read the file as buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compress the image with sharp
    const compressed = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `broders/martes-${tuesdayNumber}/${timestamp}.jpg`;

    // Upload to Vercel Blob
    const blob = await put(filename, compressed, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      tuesdayNumber: parseInt(tuesdayNumber),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error al subir la foto' }, { status: 500 });
  }
}
