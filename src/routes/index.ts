import { Router } from "express";

export class UserRoutes {
  public userRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.userRoute.get("/get", userController.getUser);
  }
}

export const userRoutes = new UserRoutes().userRoute;
