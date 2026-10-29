import type { Request, Response } from "express";
import { authService } from "./auth.service.js";

class AuthApi {
  async signup(req: Request, res: Response) {
    const user = await authService.signup(req.body ?? {});
    res.status(201).json({ success: true, data: user });
  }

  async login(req: Request, res: Response) {
    const userAgent = req.headers["user-agent"] ?? "";
    const data = await authService.login(req.body ?? {}, userAgent);
    res.json({ success: true, data });
  }

  async logout(req: Request, res: Response) {
    await authService.logout(req.auth!.token, req.auth!.userId);
    res.json({ success: true, message: "Logged out" });
  }
}

export const authApi = new AuthApi();