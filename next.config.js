/** @type {import('next').NextConfig} */
import withLess from 'next-with-less';
import path from 'node:path';

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  swcMinify: true,
  transpilePackages: [
  'antd',
  'antd-mobile',
  'rc-util',
  'rc-table',
  'rc-picker',
],
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
