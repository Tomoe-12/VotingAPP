const normalizeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_");

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

export async function uploadImageFile(
  file: File,
  prefix: string,
  password?: string,
) {
  const safeName = normalizeFileName(file.name || "upload");
  const dataUrl = await fileToDataUrl(file);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dataUrl,
      fileName: safeName,
      prefix,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Upload failed.");
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error("Upload failed.");
  }

  return data.url;
}
