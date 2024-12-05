import brcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { validateEmail } from "../utils/commonMethods.js";
import { generateToken } from "../utils/generateToken.js";
import cloudinary from "../config/cloudinary.js";

export const signup = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    // const { profilePicture } = req.file;

    if (!fullname) {
      return res.status(400).json({ message: "Fullname is required!", status: false });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required!", status: false });
    }
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email address!", status: false });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required!", status: false });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long!",
        status: false,
      });
    }

    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Email already exists!", status: false });
    }

    const salt = await brcryptjs.genSalt(10);
    const hasPassword = await brcryptjs.hash(password, salt);

    const newUser = new User({
      fullname: fullname,
      email: email,
      password: hasPassword,
      //    profilePicture: profilePicture? profilePicture.filename : null
    });

    if (newUser) {
      let token = await generateToken(newUser, res);
      await newUser.save();
      return res.status(201).json({
        message: "signup successfully",
        status: true,
        fullname: newUser.fullname,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
        token,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Failed to create user", status: false });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required!", status: false });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ message: "Invalid email address!", status: false });
    }

    if (!password) {
      return res
        .status(400)
        .json({ message: "Password is required!", status: false });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found!", status: false });
    }

    const isPasswordCorrect = await brcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ message: "Incorrect password!", status: false });
    }

    const token = await generateToken(user, res);
    return res.status(200).json({
      message: "login successfully",
      status: true,
      fullname: user.fullname,
      email: user.email,
      profilePicture: user.profilePicture,
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwtToken", "", { maxAge: 0 });
    return res
      .status(200)
      .json({ message: "logout successfully", status: true });
  } catch (error) {
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;

    const userId = req.user._id;

    if (!profilePicture) {
      return res
        .status(400)
        .json({ message: "Profile picture is required!", status: false });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePicture);

    const updatedUser = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        $set: { profilePicture: uploadResponse?.secure_url },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: error.message, status: false });
  }
};

export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json(req.user)
  } catch (error) {
    return res.status(500).json({ error: error.message, status: false });
  }
}


