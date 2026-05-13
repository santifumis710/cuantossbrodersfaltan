import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

const PASSWORD = process.env.UPLOAD_PASSWORD || 'sanfrancisco2026';

export async function POST(request) {
  try {
    const { url, password } = await request.json();

    if (!password || password !== PASSWORD) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    if (!url) {
      return NextResponse.json({ error: 'No se especificó la foto a borrar' }, { status: 400 });
    }

    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Error al borrar la foto' }, { status: 500 });
  }
}
