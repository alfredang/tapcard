import type { MetadataRoute } from "next";

const SITE_URL = "https://tapcard.tertiaryinfotech.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Signed-in surfaces and API routes carry no search value.
        disallow: ["/api/", "/dashboard", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
