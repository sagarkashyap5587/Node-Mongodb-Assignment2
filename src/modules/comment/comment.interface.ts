import type { Types } from "mongoose";

export interface CommentSchema {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  author: Types.ObjectId;
  authorName: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}