import mongoose, { Schema } from "mongoose";
import type{ CommentSchema } from "./comment.interface.js";
import { COLLECTION_NAMES } from "../../constant/constant.js";

const commentSchema = new Schema<CommentSchema>(
  {
    postId: { type: Schema.Types.ObjectId, ref: COLLECTION_NAMES.POSTS, required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: COLLECTION_NAMES.USERS, required: true },
    authorName: { type: String, required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const CommentModel = mongoose.model<CommentSchema>(COLLECTION_NAMES.COMMENTS, commentSchema);