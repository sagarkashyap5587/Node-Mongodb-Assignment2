// COPY CODE

/**
 * Every key the app reads from .env. Add a key here (and to IAppConfiguration) to make it
 * available through ConfigurationFactory.
 */
export const CONFIG_KEYS = [
  "PORT",
  "MONGO_DB_URL",
  "MONGO_DATABASE_NAME",
  "REDIS_URL",
] as const;

/** Keys that must be present, otherwise the app refuses to start. */
export const REQUIRED_CONFIG_KEYS = [
  "PORT",
  "MONGO_DB_URL",
  "MONGO_DATABASE_NAME",
  "REDIS_URL",
] as const;

export const COLLECTION_NAMES = {
  TESTING: "theaters",
  USERS: "admin",
  SESSIONS: "sessions",
  POSTS: "article",
  COMMENTS: "feedback",
};

export const AUTH_CONSTANTS = {
  SESSION_DAYS: 7,
  PROFILE_CACHE_TTL_SECONDS: 60 * 60, // 1 hour
  LOGIN_MAX_FAILS: 5,
  LOGIN_FAIL_WINDOW_SECONDS: 15 * 60, // 15 minutes
  BCRYPT_ROUNDS: 10,
};

// All Redis key names in one place
// export const REDIS_KEYS = {
//   session: (token: string) => `session:${token}`,
//   userSessions: (userId: string) => `user:${userId}:sessions`,
//   profile: (userId: string) => `user:${userId}`,
//   loginFail: (email: string) => `login:fail:${email}`,
// };

export const POST_CONSTANTS = {
  TITLE_MIN: 5,
  TITLE_MAX: 120,
  BODY_MIN: 20,
  MAX_TAGS: 5,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  MAX_SEARCH_LENGTH: 100,
  POST_CACHE_TTL_SECONDS: 10 * 60, // 10 minutes
  LIST_CACHE_TTL_SECONDS: 60, // 60 seconds
  SORTS: ["newest", "oldest", "mostCommented"] as const,
  STATUSES: ["draft", "published"] as const,
};

export const REDIS_KEYS = {
  session: (token: string) => `session:${token}`,
  userSessions: (userId: string) => `user:${userId}:sessions`,
  profile: (userId: string) => `user:${userId}`,
  loginFail: (email: string) => `login:fail:${email}`,
 
  post: (id: string) => `post:${id}`,
  postListVersion: "posts:list:version",
  postList: (
    version: string,
    page: number,
    limit: number,
    search: string,
    tag: string,
    sort: string,
  ) => `posts:list:v${version}:p${page}:l${limit}:s${search}:t${tag}:o${sort}`,
};
