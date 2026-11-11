const { WindowsBuildFilesystemPlugin } = require("./scripts/windows-build-filesystem.cjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  webpack(config) {
    if (process.platform === "win32") config.plugins.push(new WindowsBuildFilesystemPlugin());
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nxnukzawitjgnropmmgh.supabase.co",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "**",
      },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
