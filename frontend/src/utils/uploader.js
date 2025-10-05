import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

export async function chunkedUpload(file, onProgress) {
  const chunkSize = 1024 * 1024; // 1MB
  const totalChunks = Math.ceil(file.size / chunkSize);

  const initRes = await axios.post(`${API}/uploads/initiate`, {
    filename: file.name,
    total_chunks: totalChunks,
    mime_type: file.type || "application/octet-stream",
    size: file.size,
  });
  const uploadId = initRes.data.upload_id;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);

    const formData = new FormData();
    formData.append("upload_id", uploadId);
    formData.append("index", String(i));
    formData.append("chunk", blob, `${file.name}.part${i}`);

    await axios.post(`${API}/uploads/chunk`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (onProgress) onProgress(Math.round(((i + 1) / totalChunks) * 100));
  }

  const completeRes = await axios.post(`${API}/uploads/complete`, { upload_id: uploadId });
  return completeRes.data; // { file_id, filename, size }
}