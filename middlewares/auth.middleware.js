import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!accessToken) {
            return res.status(401).json(
            {
                message: "Unauthorised Request!"
            })
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            return res.status(401).json(
            {
                message: "Invalid access token!"
            })
        }

        req.user = user;
        next()
    } catch (error) {
        console.log(error)
    }
}
