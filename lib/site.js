export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "HB Softweb Blog";
export const SITE_DESCRIPTION = "Guides, ideas and stories on web development, design and modern technology from HB Softweb.";

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
