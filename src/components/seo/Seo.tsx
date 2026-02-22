import { useEffect } from "react";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  PRIMARY_KEYWORDS,
  SITE_NAME,
  buildAbsoluteUrl,
  buildTitle,
} from "@/lib/seo";

interface SeoProps {
  title: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  ogType?: "website" | "article";
  robots?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const upsertMeta = (key: "name" | "property", value: string, content: string) => {
  let tag = document.head.querySelector(`meta[${key}="${value}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(key, value);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  let link = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
};

const upsertJsonLd = (jsonLd?: Record<string, unknown> | Record<string, unknown>[]) => {
  const existing = document.getElementById("seo-jsonld");
  if (existing) {
    existing.remove();
  }

  if (!jsonLd) return;

  const script = document.createElement("script");
  script.id = "seo-jsonld";
  script.type = "application/ld+json";
  script.text = JSON.stringify(jsonLd);
  document.head.appendChild(script);
};

const Seo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = PRIMARY_KEYWORDS,
  canonicalPath,
  ogType = "website",
  robots = "index,follow",
  image = DEFAULT_OG_IMAGE,
  jsonLd,
}: SeoProps) => {
  useEffect(() => {
    const fullTitle = buildTitle(title);
    const canonicalUrl = buildAbsoluteUrl(canonicalPath ?? window.location.pathname);
    const ogImage = image.startsWith("http") ? image : buildAbsoluteUrl(image);
    const keywordString = keywords.join(", ");

    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", keywordString);
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "googlebot", robots);
    upsertMeta("name", "max-snippet", "-1");
    upsertMeta("name", "max-image-preview", "large");
    upsertMeta("name", "max-video-preview", "-1");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_US");

    upsertCanonical(canonicalUrl);
    upsertJsonLd(jsonLd);
  }, [canonicalPath, description, image, jsonLd, keywords, ogType, robots, title]);

  return null;
};

export default Seo;