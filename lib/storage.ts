import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase-client";

const normalizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_");

export async function uploadImageFile(file: File, prefix: string) {
  const safeName = normalizeFileName(file.name || "upload");
  const path = `${prefix}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
