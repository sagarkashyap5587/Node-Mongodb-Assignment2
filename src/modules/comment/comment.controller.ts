import type { Request, Response } from "express";
import { commentService } from "./comment.service.js";

class CommentApi {
  async create(req: Request, res: Response) {
    const data = await commentService.create(req.auth!.userId, String(req.params.id), req.body ?? {});
    res.status(201).json({ success: true, data });
  }

  async list(req: Request, res: Response) {
    const result = await commentService.list(String(req.params.id), req.query as Record<string, unknown>);
    res.json({ success: true, ...result });
  }

  async remove(req: Request, res: Response) {
    await commentService.remove(req.auth!.userId, String(req.params.id));
    res.json({ success: true, message: "Comment deleted" });
  }
}

export const commentApi = new CommentApi();