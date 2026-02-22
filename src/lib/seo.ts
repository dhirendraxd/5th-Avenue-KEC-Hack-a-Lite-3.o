export const SITE_NAME = "Upyog";
export const SITE_URL = "https://upyog.app";
export const DEFAULT_OG_IMAGE = "/favicon.ico";

export const PRIMARY_KEYWORDS = [
  "construction equipment rentals",
  "heavy equipment rental",
  "construction machinery rental",
  "equipment rental marketplace",
  "excavator rental",
  "scaffolding rental",
  "B2B equipment rentals",
  "tool and machinery rental",
];

export const DEFAULT_DESCRIPTION =
  "Upyog is a trusted marketplace for construction equipment rentals with verified owners, transparent pricing, and streamlined rental operations.";

export const buildAbsoluteUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};

export const buildTitle = (title: string) => `${title} | ${SITE_NAME}`;
