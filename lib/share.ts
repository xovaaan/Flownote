import { randomBytes } from "crypto";

export function generateShareToken(): string {
  return randomBytes(12).toString("base64url");
}

const PRODUCTION_APP_URL = "https://flownoteai.vercel.app";

export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return process.env.NODE_ENV === "production" ? PRODUCTION_APP_URL : "http://localhost:3000";
}

export function getShareUrl(token: string): string {
  return `${getAppBaseUrl()}/share/${token}`;
}
