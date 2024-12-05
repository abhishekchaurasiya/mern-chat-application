import { model, Schema } from "mongoose";

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim:true
      //   required: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Message = model("Message", messageSchema);
export default Message;
