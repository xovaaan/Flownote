import { randomBytes } from "crypto";

export function generateShareToken(): string {
  return randomBytes(12).toString("base64url");
}

export function getShareUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/share/${token}`;
}
