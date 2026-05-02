"use client";

import { ImagePlus } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/utils";

export function FilePickerField({
  name,
  accept,
  multiple = false,
  className
}: {
  name: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
}) {
  const id = useId();
  const [fileName, setFileName] = useState("Belum ada file dipilih");

  return (
    <div className={cn("space-y-2", className)}>
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const selectedFiles = Array.from(event.target.files || []);

          if (selectedFiles.length === 0) {
            setFileName("Belum ada file dipilih");
            return;
          }

          setFileName(
            multiple
              ? `${selectedFiles.length} file dipilih: ${selectedFiles
                  .map((file) => file.name)
                  .join(", ")}`
              : selectedFiles[0]?.name || "Belum ada file dipilih"
          );
        }}
      />
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col gap-3 rounded-[1.35rem] border border-dashed border-stone-300 bg-white/60 px-4 py-4 transition hover:border-stone-400 hover:bg-stone-50 dark:bg-white/5 dark:hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-stone-900 dark:text-stone-100">
              {multiple ? "Pilih beberapa gambar" : "Pilih gambar"}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              JPG, PNG, WEBP, atau GIF
            </p>
          </div>
        </div>
        <span className="rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-700 dark:text-stone-200">
          Pilih File
        </span>
      </label>
      <p className="truncate text-sm text-stone-600 dark:text-stone-300">{fileName}</p>
    </div>
  );
}
