// import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
// if (process.env.NODE_ENV === 'development') {
//   await setupDevPlatform();
// }

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: false,
  images: {
    domains: [
      
    ],
    remotePatterns: [
     
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig;
