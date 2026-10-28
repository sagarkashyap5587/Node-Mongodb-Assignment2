// import { postRepository } from "./post.repository.js";
import { postRepository } from "./post.repository.js";
// import { postCache } from "./post.cache.js";
import { postCache } from "./post.cache.js";
// import { commentRepository } from "../comment/comment.repository.js";
import { commentRepository } from "../comment/comment.repository.js";
import { userService } from "../user/user.service.js";
// import { ApiError } from "../../utils/ApiError.js";
import { ApiError } from "../../errors/apiError.js";
// import { assertObjectId } from "../../utils/objectId.js";
import { assertObjectId } from "../../utils/index.js";
import { POST_CONSTANTS, REDIS_KEYS } from "../../constant/constant.js";
// import type { ListQuery, PostListResult, PostSort, PostStatus, PostView } from "./post.interface.js";
import type{ ListQuery, PostListResult, PostSort, PostStatus, PostView } from "./post.interface.js";

// ---------- helpers ----------
function toPostView(p: Record<string, any>): PostView {
  const { _id, __v, author, ...rest } = p;
  return { id: _id.toString(), author: author.toString(), ...rest } as PostView;
}

const asString = (v: unknown) => (typeof v === "string" ? v : "");

function validateTitle(title: unknown): string {
  if (
    typeof title !== "string" ||
    title.trim().length < POST_CONSTANTS.TITLE_MIN ||
    title.trim().length > POST_CONSTANTS.TITLE_MAX
  ) {
    throw new ApiError(400, `Title must be between ${POST_CONSTANTS.TITLE_MIN} and ${POST_CONSTANTS.TITLE_MAX} characters`);
  }
  return title.trim();
}

function validateBody(body: unknown): string {
  if (typeof body !== "string" || body.trim().length < POST_CONSTANTS.BODY_MIN) {
    throw new ApiError(400, `Body must be at least ${POST_CONSTANTS.BODY_MIN} characters`);
  }
  return body;
}

function validateTags(tags: unknown): string[] {
  if (!Array.isArray(tags) || tags.some((t) => typeof t !== "string")) {
    throw new ApiError(400, "Tags must be an array of strings");
  }
  const clean = [...new Set(tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean))];
  if (clean.length > POST_CONSTANTS.MAX_TAGS) {
    throw new ApiError(400, `A post can have at most ${POST_CONSTANTS.MAX_TAGS} tags`);
  }
  return clean;
}

function validateStatus(status: unknown): PostStatus {
  if (!POST_CONSTANTS.STATUSES.includes(status as PostStatus)) {
    throw new ApiError(400, 'Status must be "draft" or "published"');
  }
  return status as PostStatus;
}

// Defaults are applied here so "/api/posts" and "/api/posts?page=1&limit=10" share one cache key
function parseListQuery(raw: Record<string, unknown>): ListQuery {
  let page = Number.parseInt(asString(raw.page), 10);
  if (!Number.isFinite(page) || page < 1) page = POST_CONSTANTS.DEFAULT_PAGE;

  let limit = Number.parseInt(asString(raw.limit), 10);
  if (!Number.isFinite(limit) || limit < 1) limit = POST_CONSTANTS.DEFAULT_LIMIT;
  limit = Math.min(limit, POST_CONSTANTS.MAX_LIMIT);

  const search = asString(raw.search).trim().toLowerCase().slice(0, POST_CONSTANTS.MAX_SEARCH_LENGTH);
  const tag = asString(raw.tag).trim().toLowerCase();

  const sortRaw = asString(raw.sort) || "newest";
  if (!POST_CONSTANTS.SORTS.includes(sortRaw as PostSort)) {
    throw new ApiError(400, 'Sort must be "newest", "oldest" or "mostCommented"');
  }

  return { page, limit, search, tag, sort: sortRaw as PostSort };
}

// ---------- service ----------
class PostService {
  async create(userId: string, body: Record<string, unknown>): Promise<PostView> {
    const title = validateTitle(body.title);
    const postBody = validateBody(body.body);
    const tags = body.tags === undefined ? [] : validateTags(body.tags);
    const status = body.status === undefined ? "draft" : validateStatus(body.status);

    const author = await userService.getMe(userId);
    const post = await postRepository.create({
      title,
      body: postBody,
      tags,
      author: userId,
      authorName: author.name,
      status,
    });

    await postCache.invalidateLists();
    return toPostView(post);
  }

  // Cache-aside: Redis -> MongoDB -> save (published only)
  async getOne(id: string): Promise<PostView> {
    assertObjectId(id, "post id");

    const cached = await postCache.getPost(id);
    if (cached) return cached;

    const post = await postRepository.findById(id);
    if (!post || post.status !== "published") {
      throw new ApiError(404, "Post not found"); // drafts and 404s are NOT cached
    }

    const view = toPostView(post);
    await postCache.setPost(id, view);
    return view;
  }

  async update(userId: string, id: string, body: Record<string, unknown>): Promise<PostView> {
    assertObjectId(id, "post id");

    const changes: Record<string, unknown> = {};
    if (body.title !== undefined) changes.title = validateTitle(body.title);
    if (body.body !== undefined) changes.body = validateBody(body.body);
    if (body.tags !== undefined) changes.tags = validateTags(body.tags);
    if (body.status !== undefined) changes.status = validateStatus(body.status);
    if (Object.keys(changes).length === 0) {
      throw new ApiError(400, "Send at least one of: title, body, tags, status");
    }

    const existing = await postRepository.findById(id);
    if (!existing) throw new ApiError(404, "Post not found");
    if (existing.author.toString() !== userId) {
      throw new ApiError(403, "You can only edit your own posts");
    }

    const updated = await postRepository.update(id, changes);
    if (!updated) throw new ApiError(404, "Post not found");

    await postCache.invalidatePost(id); // MongoDB first, THEN cache
    return toPostView(updated);
  }

  async remove(userId: string, id: string) {
    assertObjectId(id, "post id");

    const existing = await postRepository.findById(id);
    if (!existing) throw new ApiError(404, "Post not found");
    if (existing.author.toString() !== userId) {
      throw new ApiError(403, "You can only delete your own posts");
    }

    await postRepository.delete(id);
    await commentRepository.deleteByPostId(id); // all comments of this post
    await postCache.invalidatePost(id);
  }

  async listPublished(rawQuery: Record<string, unknown>): Promise<PostListResult> {
    const q = parseListQuery(rawQuery);

    // read the version BEFORE querying, so stale data can only land under an old key
    const version = await postCache.getListVersion();
    const key = REDIS_KEYS.postList(version, q.page, q.limit, q.search, q.tag, q.sort);

    const cached = await postCache.getList(key);
    if (cached) return cached;

    const { items, total } = await postRepository.listPublished(q);
    const result: PostListResult = {
      data: items.map(toPostView),
      pagination: { page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) },
    };

    await postCache.setList(key, result);
    return result;
  }

  // Private, changes often -> NOT cached
  async listMine(userId: string): Promise<PostView[]> {
    const posts = await postRepository.findByAuthor(userId);
    return posts.map(toPostView);
  }
}

export const postService = new PostService();