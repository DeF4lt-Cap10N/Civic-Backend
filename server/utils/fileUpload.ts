import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const upload = multer({ storage });

const cloudinaryEnabled = !!process.env.CLOUDINARY_URL;
if (cloudinaryEnabled) {
  cloudinary.config({
    secure: true,
  });
}

export async function processUploadedFile(localPath?: string): Promise<string | undefined> {
  if (!localPath) return undefined;
  try {
    if (cloudinaryEnabled) {
      const res = await cloudinary.uploader.upload(localPath, { folder: "civic-reports" });
      fs.unlink(localPath, () => {});
      return res.secure_url;
    }
    return `/uploads/${path.basename(localPath)}`;
  } catch (e) {
    console.error("File upload failed:", e);
    return `/uploads/${path.basename(localPath)}`;
  }
}
