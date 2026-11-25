import { supabase } from "@/integrations/supabase/client";
import {
  MAX_KINDLE_FILE_BYTES,
  parseKindleFile,
  type KindleDocument,
  type KindleFormat,
} from "./kindleFileParser";

export type KindleLibraryCategory = "book" | "worksheet";

export const KINDLE_LIBRARY_STANDARDS = [
  "All",
  "Pre-KG",
  "LKG",
  "UKG",
  "I",
  "II",
  "III",
  "IV",
  "V",
] as const;

export interface KindleLibraryItem {
  id: string;
  title: string;
  category: KindleLibraryCategory;
  standard: string;
  file_name: string;
  file_path?: string;
  file_format: KindleFormat;
  file_size: number;
  page_count: number;
  word_count: number;
  uploaded_by?: string | null;
  uploaded_by_email?: string | null;
  created_at: string;
}

export const KINDLE_LIBRARY_BUCKET = "kindle-library";

export function buildKindleStoragePath(fileName: string, now = Date.now()): string {
  const cleaned = fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const safeName = cleaned || "document.txt";
  return `${now}-${safeName}`;
}

export function validateKindleUploadInput(
  title: string,
  file: { name: string; size: number } | null,
): string | null {
  const trimmed = title.trim();
  if (!trimmed) return "Please enter a title for the book or worksheet.";
  if (trimmed.length > 150) return "Title must be 150 characters or fewer.";
  if (!file) return "Please choose a file to upload.";
  if (file.size <= 0) return "The selected file is empty.";
  if (file.size > MAX_KINDLE_FILE_BYTES) {
    return "File is larger than 50 MB. Please upload a smaller file.";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fetchKindleLibraryItems(staffOnly = false): Promise<KindleLibraryItem[]> {
  const { data, error } = staffOnly
    ? await supabase.from("kindle_library_items").select("*").order("created_at", { ascending: false })
    : await supabase.rpc("get_public_kindle_catalog");
  if (error) throw new Error(error.message);
  return (data ?? []) as KindleLibraryItem[];
}

export interface UploadKindleLibraryParams {
  file: File;
  title: string;
  category: KindleLibraryCategory;
  standard: string;
  userId: string;
  userEmail: string | null;
  onStatus?: (msg: string) => void;
}

export async function uploadKindleLibraryItem({
  file,
  title,
  category,
  standard,
  userId,
  userEmail,
  onStatus,
}: UploadKindleLibraryParams): Promise<KindleLibraryItem> {
  const validationError = validateKindleUploadInput(title, file);
  if (validationError) throw new Error(validationError);

  onStatus?.("Checking and reading file…");
  const parsed = await parseKindleFile(file, onStatus);
  try {
    const filePath = buildKindleStoragePath(file.name);
    onStatus?.("Uploading file to school library…");
    const { error: uploadError } = await supabase.storage
      .from(KINDLE_LIBRARY_BUCKET)
      .upload(filePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) throw new Error(uploadError.message);

    onStatus?.("Publishing to Kindle Reader library…");
    const { data, error: insertError } = await supabase
      .from("kindle_library_items")
      .insert({
        title: title.trim(),
        category,
        standard,
        file_name: file.name,
        file_path: filePath,
        file_format: parsed.format,
        file_size: file.size,
        page_count: Math.max(1, parsed.pages.length),
        word_count: Math.max(0, parsed.wordCount),
        uploaded_by: userId,
        uploaded_by_email: userEmail,
      })
      .select("*")
      .single();

    if (insertError) {
      await supabase.storage.from(KINDLE_LIBRARY_BUCKET).remove([filePath]);
      throw new Error(insertError.message);
    }
    return data as KindleLibraryItem;
  } finally {
    parsed.cleanup?.();
  }
}

export async function deleteKindleLibraryItem(
  item: Pick<KindleLibraryItem, "id" | "file_path">,
): Promise<void> {
  if (!item.file_path) throw new Error("Staff access is required to remove a library file.");
  const { error: deleteError } = await supabase
    .from("kindle_library_items")
    .delete()
    .eq("id", item.id);
  if (deleteError) throw new Error(deleteError.message);

  const { error: storageError } = await supabase.storage
    .from(KINDLE_LIBRARY_BUCKET)
    .remove([item.file_path]);
  if (storageError) {
    console.error("Failed to remove storage object:", storageError.message);
  }
}

export async function openKindleLibraryItem(
  item: KindleLibraryItem,
  onStatus?: (msg: string) => void,
): Promise<KindleDocument> {
  onStatus?.(`Downloading ${item.title}…`);
  const { data: access, error } = await supabase.functions.invoke("kindle-library-download", {
    body: { itemId: item.id },
  });
  if (error || !access?.signedUrl) {
    throw new Error("This library item is unavailable or no longer published.");
  }
  const response = await fetch(access.signedUrl);
  if (!response.ok) throw new Error("Could not download this library item.");
  const data = await response.blob();
  const file = new File([data], item.file_name, { type: data.type });
  const parsed = await parseKindleFile(file, onStatus);
  return {
    ...parsed,
    id: `library-${item.id}`,
    title: item.title,
  };
}