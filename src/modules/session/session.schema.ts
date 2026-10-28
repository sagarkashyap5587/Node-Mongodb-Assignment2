import mongoose, { Schema } from "mongoose";
import type{ SessionSchema } from "./session.interface.js";
import { COLLECTION_NAMES } from "../../constant/constant.js";

const sessionSchema = new Schema<SessionSchema>({
  userId: { type: Schema.Types.ObjectId, ref: COLLECTION_NAMES.USERS, required: true },
  token: { type: String, required: true, unique: true },
  // TTL index: MongoDB removes the document when expiresAt is reached
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  userAgent: { type: String, default: "" },
});

export const SessionModel = mongoose.model<SessionSchema>(
  COLLECTION_NAMES.SESSIONS,
  sessionSchema,
);