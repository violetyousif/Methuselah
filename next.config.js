/** @type {import('next').NextConfig} */

// Edited by: Violet Yousif
// Date: 5/31/2025
// Description: __dirname is used to get the current directory of the file
// but ESM modules do not support __dirname directly
// so we use fileURLToPath and dirname from 'node:path' to get the directory name
import withLess from 'next-with-less';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  transpilePackages: [
  'antd',
  'antd-mobile',
  'rc-util',
  'rc-table',
  'rc-picker',
],
  experimental: {
    forceSwcTransforms: true, // Enable SWC transforms
  },
  webpack(config, options) {
    // disable css-module in Next.js
    config.module.rules.forEach((rule) => {
      const { oneOf } = rule;
      if (oneOf) {
        oneOf.forEach((one) => {
          if (!`${one.issuer?.and}`.includes('_app')) return;
          one.issuer.and = [path.resolve(__dirname)];
        });
      }
    });

    return config;
  },
};

export default withLess(nextConfig);
