import fs from "fs";
import { s3 } from "../config/s3.config.js";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectVersionsCommand,
    PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { File } from "../models/file.model.js";
import { v4 as uuidv4 } from "uuid";

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        const file = req.file;

        // Generate unique S3 key
        const uniqueKey = `${req.user._id}/${uuidv4()}-${file.originalname}`;

        const fileStream = fs.createReadStream(file.path);

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: uniqueKey,
            Body: fileStream,
            ContentType: file.mimetype
        };

        const uploadResult = await s3.send(new PutObjectCommand(params));

        // Delete temp file
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // Save metadata in MongoDB
        const newFile = await File.create({
            fileName: file.originalname,
            s3Key: uniqueKey,
            fileUrl: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${uniqueKey}`,
            fileSize: file.size,
            fileType: file.mimetype,
            versionId: uploadResult.VersionId || null,
            uploadedBy: req.user._id
        });

        return res.status(201).json({
            message: "File uploaded successfully",
            file: newFile
        });

    } catch (error) {
        console.error("Upload Error:", error);

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Ensure user owns file
        if (file.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Delete from S3
        const command = new DeleteObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: file.s3Key
        });

        await s3.send(command);

        // Delete from DB
        await File.findByIdAndDelete(fileId);

        return res.status(200).json({
            message: "File deleted successfully"
        });

    } catch (error) {
        console.error("Delete File Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        if (file.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.s3Key
        });

        const signedUrl = await getSignedUrl(s3, command, {
            expiresIn: 60 // URL valid for 60 seconds
        });

        return res.status(200).json({
            downloadUrl: signedUrl
        });

    } catch (error) {
        console.error("Download Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const showVersions = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        const command = new ListObjectVersionsCommand({
            Bucket: process.env.BUCKET_NAME,
            Prefix: file.s3Key
        });

        const data = await s3.send(command);

        return res.status(200).json({
            versions: data.Versions || []
        });

    } catch (error) {
        console.error("Show Versions Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export {
    uploadFile,
    deleteFile,
    downloadFile,
    showVersions
}