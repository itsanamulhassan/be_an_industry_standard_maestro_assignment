/**
 ⚡ Multer Full Cycle (Explicit One-Line Flow):

Client fills a form with text + files
→ Browser sends an HTTP POST request with multipart/form-data
→ Express receives the raw request stream
→ Multer middleware intercepts the request before it reaches your route
→ Multer hands the stream to Busboy, which parses the multipart data into chunks (fields + files)
→ For each field, Busboy emits an event and Multer stores it in req.body
→ For each file, Busboy streams it to the configured Storage Engine (Disk, Memory, or custom)
→ The storage engine writes the file (to disk, memory, or cloud) and gives back file metadata
→ Multer collects that metadata and attaches it to req.file (for single) or req.files (for multiple)
→ Once parsing finishes, Multer calls next() and control passes to your route handler
→ In the route, you access req.body and req.file(s) as normal JS objects
→ You send a response back to the client confirming success or failure.
 */

// Form submission → HTTP POST request → Express server → Multer middleware → Busboy parser → Storage engine saves file → Multer attaches data → Route handler runs → Response returned

import { v2 as cloudinary } from "cloudinary";
import message from "../utils/message";
import { StatusCodes } from "http-status-codes";
import { ChildFolderProps } from "../types/global.types";
import crypto from "crypto";
import stream from "stream";
import { UploadApiResponse } from "cloudinary";
import environments from "./environments";
import AppError from "../helpers/error.helper";

cloudinary.config({
  api_key: environments.cloudinary.api_key,
  api_secret: environments.cloudinary.api_secret,
  cloud_name: environments.cloudinary.cloud_name,
});

export const fileUploader = (
  folderName: ChildFolderProps,
  buffer: Buffer<ArrayBufferLike>
): Promise<UploadApiResponse> => {
  const uniqueId = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ride-management-system/${folderName}`,
        public_id: `${folderName}-${uniqueId}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as unknown as UploadApiResponse);
      }
    );

    stream.Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteCloudinaryFile = async (public_id: string) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        message("delete", "Cloudinary file", error.message),
        StatusCodes.BAD_REQUEST
      );
    }
  }
};

export default cloudinary;
