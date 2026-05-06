import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

export const isR2Configured = Boolean(accountId && accessKeyId && secretAccessKey && bucket && publicUrl);

function getClient(): S3Client {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 não configurado. Verifique as variáveis R2_* no .env.local.");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export interface R2Upload {
  url: string;   // public CDN URL
  path: string;  // key stored for later deletion
}

export async function uploadToR2(
  buffer: Buffer,
  mime: string,
  folder: string
): Promise<R2Upload> {
  if (!isR2Configured) throw new Error("R2 não configurado.");

  const ext = MIME_TO_EXT[mime] ?? "jpg";
  const key = `${folder}/${randomUUID()}.${ext}`;

  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket!,
      Key: key,
      Body: buffer,
      ContentType: mime,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    url: `${publicUrl}/${key}`,
    path: key,
  };
}

export async function deleteFromR2(key: string): Promise<void> {
  if (!isR2Configured) throw new Error("R2 não configurado.");
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: bucket!, Key: key }));
}
