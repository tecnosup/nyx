import "server-only";
import { createHash } from "node:crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = Boolean(
  cloudName && apiKey && apiSecret
);

function assertConfigured(): void {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary não configurado. Preencha CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET em .env.local."
    );
  }
}

function sign(params: Record<string, string | number>): string {
  const keys = Object.keys(params).sort();
  const toSign = keys.map((k) => `${k}=${params[k]}`).join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export interface CloudinaryUpload {
  secureUrl: string;
  publicId: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
}

export async function uploadToCloudinary(
  buffer: Buffer,
  mime: string,
  folder: string
): Promise<CloudinaryUpload> {
  assertConfigured();

  const timestamp = Math.floor(Date.now() / 1000);
  const signedParams: Record<string, string | number> = {
    folder,
    timestamp,
  };
  const signature = sign(signedParams);

  const base64 = buffer.toString("base64");
  const dataUri = `data:${mime};base64,${base64}`;

  const form = new FormData();
  form.append("file", dataUri);
  form.append("folder", folder);
  form.append("timestamp", String(timestamp));
  form.append("api_key", apiKey!);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    secure_url: string;
    public_id: string;
    bytes: number;
    width: number;
    height: number;
    format: string;
  };

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  assertConfigured();

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ public_id: publicId, timestamp });

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("timestamp", String(timestamp));
  form.append("api_key", apiKey!);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary destroy ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { result?: string };
  if (data.result !== "ok" && data.result !== "not found") {
    throw new Error(`Cloudinary destroy retornou: ${data.result}`);
  }
}
