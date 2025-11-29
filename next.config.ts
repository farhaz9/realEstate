
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ik.imagekit.io',
          port: '',
          pathname: '/ei1qzvmub/**',
        },
        {
            protocol: 'https',
            hostname: 'placehold.co',
        },
        {
            protocol: 'https',
            hostname: 'images.unsplash.com',
        },
        {
            protocol: 'https',
            hostname: 'picsum.photos',
        },
        {
            protocol: 'https',
            hostname: 'images-r-eal-estae.vercel.app',
        }
    ]
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://delhi-estate-luxe-416104.web.app' // Replace with your production URL
      : 'http://localhost:9002',
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: 'public_hBq3v8n2BN4aIy1pS0N5s5b5k4Q=',
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: 'https://ik.imagekit.io/ei1qzvmub',
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  },
};

export default nextConfig;
