import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.ts$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      ],
    });
    config.experiments = { ...config.experiments, topLevelAwait: true };
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: path.resolve(__dirname, 'node_modules/buffer/'),
      };
    }

    return config;
  },

  reactStrictMode: true,
  images: {
    unoptimized: true, // Note: Required for static builds
  },
  trailingSlash: true,
  env: {
    BASE_URL: process.env.BASE_URL,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/perps',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
