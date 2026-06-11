import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Allow remote avatars/logos pasted as URLs in the builder.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
