import { CommentModel } from "./comment.schema.js";

class CommentRepository {
  async create(data: {
    postId: string;
    userId: string;
    userName: string;
    text: string;
  }) {
    const comment = await CommentModel.create(data);
    return comment.toObject();
  }

  async findById(id: string) {
    return CommentModel.findById(id).lean();
  }

  async deleteById(id: string) {
    return CommentModel.deleteOne({ _id: id });
  }

  async deleteByPostId(postId: string) {
    return CommentModel.deleteMany({ postId });
  }

  // newest first, page of data + total count
  async listByPost(postId: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      CommentModel.find({ postId })
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CommentModel.countDocuments({ postId }),
    ]);
    return { items, total };
  }
}

export const commentRepository = new CommentRepository();
