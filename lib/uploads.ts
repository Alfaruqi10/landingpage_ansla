import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

type UploadFolder = "products" | "categories" | "testimonials" | "banners" | "payments";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET || "";

function getExtension(file: File) {
  const byMimeType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif"
  };

  if (file.type in byMimeType) {
    return byMimeType[file.type];
  }

  const extension = path.extname(file.name).toLowerCase();
  return extension || ".jpg";
}

function hasSupabaseStorageConfig() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey && supabaseStorageBucket);
}

function encodeObjectPath(value: string) {
  return value
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildSupabasePublicUrl(objectPath: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${encodeURIComponent(
    supabaseStorageBucket
  )}/${encodeObjectPath(objectPath)}`;
}

async function saveToSupabaseStorage(file: File, folder: UploadFolder) {
  const extension = getExtension(file);
  const objectPath = `${folder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}${extension}`;
  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${encodeURIComponent(
      supabaseStorageBucket
    )}/${encodeObjectPath(objectPath)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        apikey: supabaseServiceRoleKey,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true"
      },
      body: Buffer.from(await file.arrayBuffer()),
      cache: "no-store"
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Upload gambar gagal ke storage. ${errorText || "Pastikan bucket dan credential Supabase sudah benar."}`
    );
  }

  return buildSupabasePublicUrl(objectPath);
}

async function saveToLocalUploads(file: File, folder: UploadFolder) {
  const extension = getExtension(file);
  const filename = `${randomUUID()}${extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads", folder);
  const outputPath = path.join(uploadDirectory, filename);
  const bytes = await file.arrayBuffer();

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(outputPath, Buffer.from(bytes));

  return `/uploads/${folder}/${filename}`;
}

export async function saveUploadedImage(
  file: FormDataEntryValue | null,
  folder: UploadFolder
) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("File gambar harus JPG, PNG, WEBP, atau GIF.");
  }

  if (hasSupabaseStorageConfig()) {
    return saveToSupabaseStorage(file, folder);
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Upload file lokal di deployment memerlukan storage persisten. Isi SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, dan SUPABASE_STORAGE_BUCKET terlebih dulu."
    );
  }

  return saveToLocalUploads(file, folder);
}

export async function saveUploadedImages(
  files: FormDataEntryValue[],
  folder: UploadFolder
) {
  const uploadedImages: string[] = [];

  for (const file of files) {
    const uploadedImage = await saveUploadedImage(file, folder);

    if (uploadedImage) {
      uploadedImages.push(uploadedImage);
    }
  }

  return uploadedImages;
}
