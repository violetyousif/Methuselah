// Violet Yousif, 07/12/2024, Create a Babel configuration file for a Next.js application with TypeScript support.

// might need to be a .cjs file depending on your setup
// babel.config.js
module.exports = {
  presets: [
    'next/babel',
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
};

// export default {
//   presets: [
//     'next/babel',
//   ],
// };
