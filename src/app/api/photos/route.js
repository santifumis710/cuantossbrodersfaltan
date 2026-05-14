import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'broders/' });

    const photos = blobs.map(blob => {
      // Extract tuesday number from path: broders/martes-{N}/{timestamp}.jpg
      const match = blob.pathname.match(/martes-(\d+)/);
      const tuesdayNumber = match ? parseInt(match[1]) : 0;

      return {
        url: blob.downloadUrl || blob.url,
        tuesdayNumber,
        uploadedAt: blob.uploadedAt,
        pathname: blob.pathname,
      };
    });

    // Sort by tuesday number desc, then by upload date desc
    photos.sort((a, b) => {
      if (b.tuesdayNumber !== a.tuesdayNumber) {
        return b.tuesdayNumber - a.tuesdayNumber;
      }
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json({ photos: [] });
  }
}
