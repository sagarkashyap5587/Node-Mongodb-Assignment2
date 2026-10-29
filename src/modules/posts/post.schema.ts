import mongoose, { Schema } from "mongoose";
import type{ PostSchema } from "./post.interface.js";
import { COLLECTION_NAMES, POST_CONSTANTS } from "../../constant/constant.js";

const postSchema = new Schema<PostSchema>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: POST_CONSTANTS.TITLE_MIN,
      maxlength: POST_CONSTANTS.TITLE_MAX,
    },
    body: { type: String, required: true, minlength: POST_CONSTANTS.BODY_MIN },
    // embedded tags, lowercase, max 5
    tags: {
      type: [{ type: String, lowercase: true, trim: true }],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= POST_CONSTANTS.MAX_TAGS,
        message: `A post can have at most ${POST_CONSTANTS.MAX_TAGS} tags`,
      },
    },
    author: { type: Schema.Types.ObjectId, ref: COLLECTION_NAMES.USERS, required: true },
    authorName: { type: String, required: true },
    status: { type: String, enum: POST_CONSTANTS.STATUSES, default: "draft" },
    commentCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ status: 1, tags: 1 });
postSchema.index({ author: 1, createdAt: -1 });

export const PostModel = mongoose.model<PostSchema>(COLLECTION_NAMES.POSTS, postSchema);