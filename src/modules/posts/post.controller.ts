import type { Request, Response } from "express";
import { postService } from "./post.service.js";

class PostApi {
  async create(req: Request, res: Response) {
    const data = await postService.create(req.auth!.userId, req.body ?? {});
    res.status(201).json({ success: true, data });
  }

  async getOne(req: Request, res: Response) {
    const data = await postService.getOne(String(req.params.id));
    res.json({ success: true, data });
  }

  async update(req: Request, res: Response) {
    const data = await postService.update(req.auth!.userId, String(req.params.id), req.body ?? {});
    res.json({ success: true, data });
  }

  async remove(req: Request, res: Response) {
    await postService.remove(req.auth!.userId, String(req.params.id));
    res.json({ success: true, message: "Post deleted" });
  }

  async list(req: Request, res: Response) {
    const result = await postService.listPublished(req.query as Record<string, unknown>);
    res.json({ success: true, ...result });
  }

  async myPosts(req: Request, res: Response) {
    const data = await postService.listMine(req.auth!.userId);
    res.json({ success: true, data });
  }
}

export const postApi = new PostApi();