import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/", "/mypage/"],
      },
    ],
    sitemap: "https://www.smartechvacuum.com/sitemap.xml",
  };
}
