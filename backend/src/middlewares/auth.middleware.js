import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


const protectedRoute = async (req, res, next) => {
    try {
        const token =
            req.cookies.jwtToken || req?.header?.authorization?.split(" ")[1]; // ["Bearer" "token"]
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided.", status: false });
        }

        let decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(403).json({ message: "Access denied - Invalid token", status: false });
        }

        let user = await User.findById({ _id: decoded.id }).select("-password -__v");
        if (!user) {
            return res.status(404).json({ message: "User not found", status: false });  // User not found in the database.
        }
      
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ error: error.message, status: false });
    }
};

export default protectedRoute;