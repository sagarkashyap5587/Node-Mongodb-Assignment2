import { CommentModel } from "./comment.schema.js";

class CommentRepository {
  async deleteByPostId(postId: string) {
    return CommentModel.deleteMany({ postId });
  }
}

export const commentRepository = new CommentRepository();