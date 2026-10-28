import type { Request, Response } from "express";
import { userService } from "./user.service.js";

class UserApi {
  async getMe(req: Request, res: Response) {
    const data = await userService.getMe(req.auth!.userId);
    res.json({ success: true, data });
  }

  async updateMe(req: Request, res: Response) {
    const data = await userService.updateMe(req.auth!.userId, req.body?.name);
    res.json({ success: true, data });
  }
}

export const userApi = new UserApi();