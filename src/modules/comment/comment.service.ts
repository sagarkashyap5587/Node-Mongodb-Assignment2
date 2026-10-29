import { commentRepository } from "./comment.repository.js";
import { postRepository } from "../posts/post.repository.js";
import { postCache } from "../posts/post.cache.js";
import { userService } from "../user/user.service.js";
import { ApiError } from "../../errors/apiError.js";
import { assertObjectId } from "../../utils/index.js";
import { parsePagination } from "../../utils/index.js";
import { COMMENT_CONSTANTS } from "../../constant/constant.js";

import type{ CommentListResult, CommentView } from "./comment.interface.js";



function toCommentView(c: Record<string, any>): CommentView {
  const { _id, __v, postId, userId, ...rest } = c;
  return { id: _id.toString(), postId: postId.toString(), userId: userId.toString(), ...rest } as CommentView;
}

function validateText(text: unknown): string {
  if (
    typeof text !== "string" ||
    text.trim().length < COMMENT_CONSTANTS.TEXT_MIN ||
    text.trim().length > COMMENT_CONSTANTS.TEXT_MAX
  ) {
    throw new ApiError(
      400,
      `Comment text must be between ${COMMENT_CONSTANTS.TEXT_MIN} and ${COMMENT_CONSTANTS.TEXT_MAX} characters`,
    );
  }
  return text.trim();
}

class CommentService {
  async create(userId: string, postId: string, body: Record<string, unknown>): Promise<CommentView> {
    assertObjectId(postId, "post id");
    const text = validateText(body.text);

    const post = await postRepository.findById(postId);
    if (!post || post.status !== "published") {
      throw new ApiError(404, "Post not found"); // comments only on published posts
    }

    const user = await userService.getMe(userId);

    // MongoDB first (comment + $inc), THEN Redis
    const comment = await commentRepository.create({ postId, userId, userName: user.name, text });
    await postRepository.incrementCommentCount(postId, 1);
    await postCache.invalidatePost(postId); // DEL post:<id> + INCR posts:list:version

    return toCommentView(comment);
  }

  async list(postId: string, rawQuery: Record<string, unknown>): Promise<CommentListResult> {
    assertObjectId(postId, "post id");

    const post = await postRepository.findById(postId);
    if (!post || post.status !== "published") throw new ApiError(404, "Post not found");

    const { page, limit } = parsePagination(rawQuery);
    const { items, total } = await commentRepository.listByPost(postId, page, limit);

    return {
      data: items.map(toCommentView),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async remove(userId: string, commentId: string) {
    assertObjectId(commentId, "comment id");

    const comment = await commentRepository.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const postId = comment.postId.toString();
    const post = await postRepository.findById(postId);

    const isCommentAuthor = comment.userId.toString() === userId;
    const isPostAuthor = !!post && post.author.toString() === userId;
    if (!isCommentAuthor && !isPostAuthor) {
      throw new ApiError(403, "Only the comment author or the post author can delete this comment");
    }

    const result = await commentRepository.deleteById(commentId);
    if (result.deletedCount === 0) throw new ApiError(404, "Comment not found"); // deleted by someone else just now

    if (post) await postRepository.incrementCommentCount(postId, -1);
    await postCache.invalidatePost(postId);
  }
}

export const commentService = new CommentService();