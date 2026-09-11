// Uploaded files are served from the backend's /uploads path. Same-origin
// deploys can use that relative path directly; a split deploy (frontend on
// Vercel, backend on Render) needs it prefixed with the backend's origin,
// same VITE_API_URL used for the API base and socket connection.
const ASSET_ORIGIN = import.meta.env.VITE_API_URL || "";

export function resolveAsset(url) {
  if (!url) return null;
  if (/^https?:\/\/|^data:/i.test(url)) return url;
  return `${ASSET_ORIGIN}${url}`;
}

export async function uploadFile(api, file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}
