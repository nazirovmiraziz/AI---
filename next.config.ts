import type { NextConfig } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";

const avatarGlb = existsSync(join(process.cwd(), "public", "avatar.glb")) ? "/avatar.glb" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_AVATAR_GLB: avatarGlb,
  },
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "microaischooll.pp.ua" }],
        destination: "https://www.microaischooll.pp.ua/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
