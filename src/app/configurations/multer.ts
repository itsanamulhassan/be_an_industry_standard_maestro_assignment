import crypto from "crypto";
import path from "path";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";
import multer from "multer";
import { ChildFolderProps } from "../types/global.types";

export function multerUpload(folderName: ChildFolderProps) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => {
      // Safely extract filename and extension
      const { name, ext } = path.parse(file.originalname);

      // Sanitize filename: lowercase, replace spaces, strip invalid chars
      const safeName = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Generate strong unique id (UUID v4 is collision-safe)
      const uniqueId = crypto.randomUUID();

      return {
        folder: `ride-management-system/${folderName}`,
        public_id: `${uniqueId}-${safeName}`,
        resource_type: "auto",
        format: ext.replace(".", ""),
      };
    },
  });

  return multer({ storage });
}
