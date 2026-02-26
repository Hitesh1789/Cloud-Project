import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadFile ,deleteFile,showVersions,downloadFile,getFiles} from "../controllers/file.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this fil

router.post("/uploadFile", upload.single("file"), uploadFile);
router.delete("/deleteFile/:fileId",deleteFile);
router.get("/showVersions/:fileId",showVersions);
router.get("/downloadFile/:fileId",downloadFile);
router.get("/getFiles",getFiles); 

export default router;