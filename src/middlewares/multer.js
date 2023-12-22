import { fileURLToPath } from "url";
import { dirname, join } from "path";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
export const srcDir = dirname(__filename);
export const __dirname = join(srcDir, "..");

/* const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/public/img/products`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
export const uploader = multer({ storage }).single("file"); */

const CustomStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { fileType } = req.body;
    let uploadPath = `${__dirname}/public/img`;

    switch (fileType) {
      case "profile":
        uploadPath += "/profiles";
        break;
      case "product":
        uploadPath += "/products";
        break;
      case "document":
        uploadPath += "/documents";
        break;
      default:
        return uploadPath;
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
export const uploaders = multer({ storage: CustomStorage }).array("files");
