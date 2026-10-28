import mongoose, { Schema } from "mongoose";
import type{ UserSchema } from "./user.interface.js";
import { COLLECTION_NAMES } from "../../constant/constant.js";

const userSchema = new Schema<UserSchema>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select:false -> password is never loaded unless explicitly asked (login only)
    password: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<UserSchema>(COLLECTION_NAMES.USERS, userSchema);