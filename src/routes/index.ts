import { Router } from "express";
import { testingApi } from "../modules/testing1/testing.controller.js";

export class UserRoutes {
  public userRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.userRoute.get("/get", testingApi.getTheatreData);
  }
}

export const userRoutes = new UserRoutes().userRoute;
