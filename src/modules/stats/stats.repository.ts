import { PostModel } from "../posts/post.schema.js";
import { UserModel } from "../user/user.schema.js";
import { STATS_CONSTANTS } from "../../constant/constant.js";
import type { StatsData } from "./stats.interface.js";

class StatsRepository {
  // ONE aggregation query, four results ($facet)
  async getStats(): Promise<StatsData> {
    const [result] = await PostModel.aggregate([
      { $match: { status: "published" } },
      {
        $facet: {
          // a) total published posts
          total: [{ $count: "count" }],

          // b) top tags
          topTags: [
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: STATS_CONSTANTS.TOP_TAGS },
            { $project: { _id: 0, tag: "$_id", count: 1 } },
          ],

          // c) top authors, name from the users collection
          topAuthors: [
            { $group: { _id: "$author", postCount: { $sum: 1 } } },
            { $sort: { postCount: -1, _id: 1 } },
            { $limit: STATS_CONSTANTS.TOP_AUTHORS },
            {
              $lookup: {
                from: UserModel.collection.name,
                localField: "_id",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $project: {
                _id: 0,
                authorId: "$_id",
                name: { $arrayElemAt: ["$user.name", 0] },
                postCount: 1,
              },
            },
          ],

          // d) most commented posts
          topCommented: [
            { $sort: { commentCount: -1, createdAt: -1, _id: -1 } },
            { $limit: STATS_CONSTANTS.TOP_COMMENTED },
            { $project: { _id: 0, id: "$_id", title: 1, commentCount: 1 } },
          ],
        },
      },
    ]);

    // ObjectIds -> strings, so fresh and cached responses are identical
    return {
      totalPublishedPosts: result?.total?.[0]?.count ?? 0,
      topTags: result?.topTags ?? [],
      topAuthors: (result?.topAuthors ?? []).map((a: any) => ({
        authorId: a.authorId.toString(),
        name: a.name ?? null,
        postCount: a.postCount,
      })),
      topCommentedPosts: (result?.topCommented ?? []).map((p: any) => ({
        id: p.id.toString(),
        title: p.title,
        commentCount: p.commentCount,
      })),
    };
  }
}

export const statsRepository = new StatsRepository();