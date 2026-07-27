import type { NextConfig } from "next";
import { assertProductionEnv } from "./src/lib/env-check";

// Fail a misconfigured production build loudly, here, rather than shipping an
// app that silently emits dead card links or hides the Google button. Skipped
// in dev, and for a local `npm run build` you can opt out with SKIP_ENV_CHECK=1.
if (process.env.NODE_ENV === "production" && process.env.SKIP_ENV_CHECK !== "1") {
  assertProductionEnv();
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Allow remote avatars/logos pasted as URLs in the builder.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
