import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadFile ,deleteFile,showVersions,downloadFile} from "../controllers/file.controller.js";

const router = express.Router();

router.post("/uploadFile", upload.single("file"), uploadFile);
router.delete("/deleteFile/:fileId",deleteFile);
router.get("/showVersions/:fileId",showVersions);
router.get("/downloadFile/:fileId",downloadFile);

export default router;