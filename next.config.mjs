/**
 * Fully static site: every page renders in the browser and nothing is stored on a server,
 * so `next build` writes plain files to out/ that any static host can serve.
 * On GitHub Pages the site lives under /<repo>, which the deploy workflow passes in.
 * @type {import('next').NextConfig}
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  // macOS writes "._*" AppleDouble files on exFAT drives; keep them out of the build.
  webpack: (config) => {
    config.watchOptions = { ...config.watchOptions, ignored: ["**/node_modules/**", "**/._*"] };
    return config;
  },
};

export default nextConfig;
