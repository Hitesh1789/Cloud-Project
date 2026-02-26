import mongoose, { Schema } from "mongoose";

const fileSchema = new Schema({
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    s3Key: {
        type: String,
        required: true
    },
    versionId: {
        type: String  
    },
    uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const File = mongoose.model("File", fileSchema);