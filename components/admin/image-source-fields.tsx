import Image from "next/image";

import { FilePickerField } from "@/components/admin/file-picker-field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ImageSourceFields({
  baseId,
  currentImageUrl,
  imageUrlValue,
  required = false
}: {
  baseId: string;
  currentImageUrl?: string | null;
  imageUrlValue?: string | null;
  required?: boolean;
}) {
  return (
    <div className="space-y-4 lg:col-span-2">
      {currentImageUrl ? (
        <div className="rounded-[1.25rem] border border-dashed border-stone-300 p-4">
          <p className="text-sm font-medium text-stone-700">Gambar aktif</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start">
            <Image
              src={currentImageUrl}
              alt="Preview gambar aktif"
              width={96}
              height={112}
              className="h-28 w-24 rounded-2xl border border-stone-200 object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                Path / URL saat ini
              </p>
              <p className="mt-2 break-all text-sm text-stone-600">{currentImageUrl}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <Label htmlFor={`${baseId}-image-url`}>
          Link Gambar {required ? "(wajib jika tidak upload file)" : "(opsional)"}
        </Label>
        <Input
          id={`${baseId}-image-url`}
          name="imageUrl"
          className="mt-2"
          defaultValue={imageUrlValue ?? currentImageUrl ?? ""}
        />
      </div>

      <div>
        <Label htmlFor={`${baseId}-image-file`}>Upload Gambar dari Komputer</Label>
        <div id={`${baseId}-image-file`} className="mt-2">
          <FilePickerField
            name="imageFile"
            accept="image/png,image/jpeg,image/webp,image/gif"
          />
        </div>
        <p className="mt-2 text-sm text-stone-500">
          Jika file dipilih, sistem akan memakai file upload dan mengabaikan link gambar.
        </p>
      </div>
    </div>
  );
}
