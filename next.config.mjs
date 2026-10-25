/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // macOS writes "._*" AppleDouble files on exFAT drives; keep them out of the build.
  webpack: (config) => {
    config.watchOptions = { ...config.watchOptions, ignored: ["**/node_modules/**", "**/._*", "**/data/**"] };
    return config;
  },
};
export default nextConfig;
