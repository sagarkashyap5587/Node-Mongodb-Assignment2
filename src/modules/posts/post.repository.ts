import { PostModel } from "./post.schema.js";
import type { ListQuery, PostStatus } from "./post.interface.js";

const SORTS = {
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  mostCommented: { commentCount: -1, createdAt: -1, _id: -1 },
} as const;

class PostRepository {
  async create(data: {
    title: string;
    body: string;
    tags: string[];
    author: string;
    authorName: string;
    status?: PostStatus;
  }) {
    const post = await PostModel.create(data);
    return post.toObject();
  }

  async findById(id: string) {
    return PostModel.findById(id).lean();
  }

  async update(id: string, changes: Record<string, unknown>) {
    return PostModel.findByIdAndUpdate(
      id,
      { $set: changes },
      { new: true, runValidators: true },
    ).lean();
  }

  async delete(id: string) {
    return PostModel.deleteOne({ _id: id });
  }

  async findByAuthor(userId: string) {
    return PostModel.find({ author: userId })
      .sort({ createdAt: -1, _id: -1 })
      .lean();
  }

  // Page of data AND total count in ONE query ($facet), body not returned
  async listPublished(q: ListQuery) {
    const match: Record<string, unknown> = { status: "published" };
    if (q.search) {
      match.title = {
        $regex: q.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }
    if (q.tag) match.tags = q.tag;

    const [result] = await PostModel.aggregate<{
      data: Record<string, any>[];
      total: { count: number }[];
    }>([
      { $match: match },
      {
        $facet: {
          data: [
            { $sort: SORTS[q.sort] },
            { $skip: (q.page - 1) * q.limit },
            { $limit: q.limit },
            { $project: { body: 0, __v: 0 } },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    return { items: result?.data ?? [], total: result?.total[0]?.count ?? 0 };
  }
}

export const postRepository = new PostRepository();
