import mongoose, { Schema } from "mongoose";
import type { CommentSchema } from "./comment.interface.js";
import { COLLECTION_NAMES, COMMENT_CONSTANTS } from "../../constant/constant.js";

const commentSchema = new Schema<CommentSchema>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.POSTS,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USERS,
      required: true,
    },
    userName: { type: String, required: true },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: COMMENT_CONSTANTS.TEXT_MIN,
      maxlength: COMMENT_CONSTANTS.TEXT_MAX,
    },
  },
  { timestamps: true },
);

commentSchema.index({ postId: 1, createdAt: -1 });

export const CommentModel = mongoose.model<CommentSchema>(
  COLLECTION_NAMES.COMMENTS,
  commentSchema,
);
