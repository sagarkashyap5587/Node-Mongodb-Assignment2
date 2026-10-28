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
};

export const AUTH_CONSTANTS = {
  SESSION_DAYS: 7,
  PROFILE_CACHE_TTL_SECONDS: 60 * 60, // 1 hour
  LOGIN_MAX_FAILS: 5,
  LOGIN_FAIL_WINDOW_SECONDS: 15 * 60, // 15 minutes
  BCRYPT_ROUNDS: 10,
};

// All Redis key names in one place
export const REDIS_KEYS = {
  session: (token: string) => `session:${token}`,
  userSessions: (userId: string) => `user:${userId}:sessions`,
  profile: (userId: string) => `user:${userId}`,
  loginFail: (email: string) => `login:fail:${email}`,
};
