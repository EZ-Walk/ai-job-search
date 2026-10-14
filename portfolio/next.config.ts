import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/projects", destination: "/blog", permanent: true },
      { source: "/projects/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.notion.so" },
      { protocol: "https", hostname: "notion.so" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "prod-files-secure.s3.us-west-2.amazonaws.com" },
      { protocol: "https", hostname: "s3.us-west-2.amazonaws.com" },
    ],
  },
};

export default nextConfig;
