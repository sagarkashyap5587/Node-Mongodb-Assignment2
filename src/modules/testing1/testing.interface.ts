import type { ObjectId } from "mongoose";

export interface TheaterSchema {
  _id: ObjectId;
  theaterId: number;
  location: {
    address: {
      street1: string;
      city: string;
      state: string;
      zipcode: string;
    };
    geo: {
      type: "Point";
      coordinates: [number, number];
    };
  };
}
