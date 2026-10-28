import type { Types } from "mongoose";

export interface SessionSchema {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  userAgent: string;
}