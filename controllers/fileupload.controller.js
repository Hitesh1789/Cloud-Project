import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.config.js";

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }
        const file = req.file;

        const fileStream = fs.createReadStream(file.path);

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: file.filename,
            Body: fileStream,
            ContentType: file.mimetype
        };

        await s3.send(new PutObjectCommand(params));

        // Delete temp file after upload
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        const fileUrl = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${file.filename}`;

        return res.status(200).json({
            message: "File uploaded successfully to S3",
            url: fileUrl
        });
    } 
    catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};