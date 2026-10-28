import { Router } from "express";
import { testingApi } from "../modules/testing1/testing.controller.js";
import { authApi } from "../modules/auth/auth.contorller.js";
import { userApi } from "../modules/user/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../errors/asyncHandler.js";
import { postApi } from "../modules/posts/post.controller.js";

export class UserRoutes {
  public userRoute = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Testing
    this.userRoute.get(
      "/get",
      asyncHandler((req, res) => testingApi.getTheatreData(req, res)),
    );

    // Auth
    this.userRoute.post(
      "/auth/signup",
      asyncHandler((req, res) => authApi.signup(req, res)),
    );
    this.userRoute.post(
      "/auth/login",
      asyncHandler((req, res) => authApi.login(req, res)),
    );
    this.userRoute.post(
      "/auth/logout",
      authMiddleware,
      asyncHandler((req, res) => authApi.logout(req, res)),
    );

    // Users
    this.userRoute.get(
      "/users/me",
      authMiddleware,
      asyncHandler((req, res) => userApi.getMe(req, res)),
    );
    this.userRoute.patch(
      "/users/me",
      authMiddleware,
      asyncHandler((req, res) => userApi.updateMe(req, res)),
    );

    this.userRoute.get(
      "/posts",
      asyncHandler((req, res) => postApi.list(req, res)),
    );
    this.userRoute.get(
      "/posts/:id",
      asyncHandler((req, res) => postApi.getOne(req, res)),
    );

    // Posts (login needed)
    this.userRoute.post(
      "/posts",
      authMiddleware,
      asyncHandler((req, res) => postApi.create(req, res)),
    );
    this.userRoute.patch(
      "/posts/:id",
      authMiddleware,
      asyncHandler((req, res) => postApi.update(req, res)),
    );
    this.userRoute.delete(
      "/posts/:id",
      authMiddleware,
      asyncHandler((req, res) => postApi.remove(req, res)),
    );
    this.userRoute.get(
      "/users/me/posts",
      authMiddleware,
      asyncHandler((req, res) => postApi.myPosts(req, res)),
    );
  }
}

export const userRoutes = new UserRoutes().userRoute;
