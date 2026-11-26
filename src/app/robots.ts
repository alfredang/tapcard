import type { MetadataRoute } from "next";

const SITE_URL = "https://tapcard.tertiaryinfotech.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Signed-in surfaces and API routes carry no search value.
        // /login and /register stay crawlable on purpose: blocking them got
        // them "Indexed, though blocked by robots.txt" because Google could
        // never read their noindex. Their pages set robots noindex instead.
        disallow: ["/api/", "/dashboard"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
