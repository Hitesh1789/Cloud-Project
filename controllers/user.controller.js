import { User } from "../models/user.model.js";

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check empty fields
        if ([name, email, password].some(field => !field?.trim())) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existedUser = await User.findOne({ email });

        if (existedUser) {
            return res.status(409).json({
                message: "User with email already exists"
            });
        }

        // Create user
        const user = await User.create({
            name: name.toLowerCase(),
            email,
            password
        });

        // Remove sensitive fields
        const createdUser = await User.findById(user._id)
            .select("-password -refreshToken");

        return res.status(201).json({
            message: "User registered successfully",
            data: createdUser
        });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};

const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "email is required"
            });
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "User does not exist."
            });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid user credentials! Invalid Password"
            });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        if (!loggedInUser) {
            return res.status(500).json({
                message: "Something went wrong while login the user."
            });
        }

        const options = {
            httpOnly: true,
            secure: false
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                message: "User logged In successfully.",
                data: {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
            })
    }
    catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message
        });
    }
}

const logoutUser = async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        )
    
        const options = {
            httpOnly: true,
            secure: false
        }
    
        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({ message: "User logout successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error: error.message
        });
    }
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    }
    catch (error) {
        console.log(error)
    }
}

export { registerUser, loginUser, logoutUser };