/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],  // moved outside experimental
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
}

export default nextConfig
