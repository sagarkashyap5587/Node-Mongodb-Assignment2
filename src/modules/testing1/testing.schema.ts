import mongoose, { Schema } from "mongoose";
import type { TheaterSchema } from "./testing.interface.js";
import { COLLECTION_NAMES } from "../../constant/constant.js";

const theaterSchema = new Schema<TheaterSchema>({
  theaterId: Number,
  location: {
    address: {
      street1: String,
      city: String,
      state: String,
      zipcode: String,
    },
    geo: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: [Number],
    },
  },
});

export const TheaterModel = mongoose.model<TheaterSchema>(
  COLLECTION_NAMES.TESTING,
  theaterSchema,
);
