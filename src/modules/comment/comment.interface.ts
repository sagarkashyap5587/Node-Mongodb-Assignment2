import type { Types } from "mongoose";

export interface CommentSchema {
  _id: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentView {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentListResult {
  data: CommentView[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}