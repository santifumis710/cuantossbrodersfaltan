/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  // Allow larger request bodies for photo uploads (up to 10MB after compression)
  serverExternalPackages: [],
};

export default nextConfig;
