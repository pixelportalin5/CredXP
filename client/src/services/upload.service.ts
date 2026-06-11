import axios from "axios";
import { compressImageToBlob } from "@/utils/compressImage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type ImageCategory = "property" | "coworking" | "avatar" | "proposal";

export interface UploadedImage {
  success: boolean;
  imageUrl: string;
  publicId: string;
}

export async function uploadImageFile(
  file: File,
  category: ImageCategory,
  replacePublicId?: string
): Promise<UploadedImage> {
  const blob = await compressImageToBlob(file);
  const formData = new FormData();
  formData.append("image", blob, file.name.replace(/\.[^.]+$/, ".jpg") || "image.jpg");
  formData.append("category", category);

  if (replacePublicId) {
    formData.append("replacePublicId", replacePublicId);
  }

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("credxp_token") : null;

  const response = await axios.post<UploadedImage>(`${API_BASE}/uploads/image`, formData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  });

  return response.data;
}

const uploadService = {
  uploadImageFile,
};

export default uploadService;
