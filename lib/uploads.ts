import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

export async function saveUploadedImage(
  file: FormDataEntryValue | null,
  folder: "products" | "categories" | "testimonials" | "banners" | "payments"
) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!allowedMimeTypes.has(file.type)) {
    throw new Error("File gambar harus JPG, PNG, WEBP, atau GIF.");
  }

  const extension = getExtension(file);
  const filename = `${randomUUID()}${extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads", folder);
  const outputPath = path.join(uploadDirectory, filename);
  const bytes = await file.arrayBuffer();

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(outputPath, Buffer.from(bytes));

  return `/uploads/${folder}/${filename}`;
}

export async function saveUploadedImages(
  files: FormDataEntryValue[],
  folder: "products" | "categories" | "testimonials" | "banners" | "payments"
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
