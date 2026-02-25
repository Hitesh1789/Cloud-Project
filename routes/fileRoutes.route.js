import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadFile } from "../controllers/fileupload.controller.js";

const router = express.Router();

router.post("/uploadFile", upload.single("file"), uploadFile);

export default router;