/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['172.16.0.65','192.168.1.102','172.16.0.2'],
}

export default nextConfig
