/* eslint-disable @typescript-eslint/no-explicit-any */
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    console.log("✅ Webpack bundler activé");
    return config;
  },
  images: {
    domains: ["img.clerk.com"],
  },
};

module.exports = nextConfig;
