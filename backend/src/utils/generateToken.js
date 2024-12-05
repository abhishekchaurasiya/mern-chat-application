import jwt from "jsonwebtoken";

export const generateToken = async (user, res) => {
  try {
    const payload = {
      id: user?._id,
      email: user?.email,
    };
    // generate the token
    const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });

    res.cookie("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 5 * 24 * 60 * 60 * 1000, // Milliseconds
      // expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 5), // 5 days
      // secure: process.env.NODE_ENV === "production",
    });

    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};
