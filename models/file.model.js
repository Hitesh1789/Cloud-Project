import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema({
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    s3Key: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number
    },
    fileType: {
        type: String
    },
    versionId: {
        type: String   //For   S3 versioning
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const File = mongoose.model("File", fileSchema);