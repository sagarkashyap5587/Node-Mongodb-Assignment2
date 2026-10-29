import type { Types } from "mongoose";

export type PostStatus = "draft" | "published";
export type PostSort = "newest" | "oldest" | "mostCommented";

export interface PostSchema {
  _id: Types.ObjectId;
  title: string;
  body: string;
  tags: string[];
  author: Types.ObjectId;
  authorName: string;
  status: PostStatus;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// What we send to the front-end. body is missing in list responses.
export interface PostView {
  id: string;
  title: string;
  body?: string;
  tags: string[];
  author: string;
  authorName: string;
  status: PostStatus;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListQuery {
  page: number;
  limit: number;
  search: string;
  tag: string;
  sort: PostSort;
}

export interface PostListResult {
  data: PostView[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}