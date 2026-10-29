export interface StatsData {
  totalPublishedPosts: number;
  topTags: { tag: string; count: number }[];
  topAuthors: { authorId: string; name: string | null; postCount: number }[];
  topCommentedPosts: { id: string; title: string; commentCount: number }[];
}