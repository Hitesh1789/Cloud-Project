import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes.route.js";
import cookieParser from "cookie-parser"

dotenv.config({ 
    path:'./.env'
})

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN
}
));
app.use(express.json());
app.use(cookieParser())

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

app.use("/api/files", fileRoutes);