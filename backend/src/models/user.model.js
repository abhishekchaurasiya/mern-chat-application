import { model, Schema } from "mongoose";

const userSchema = new Schema(
    {
        fullname: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minlength: 6 },
        profilePicture: { type: String, default: "" },
    },
    { timestamps: true }
);

const User = model("User", userSchema);
export default User;