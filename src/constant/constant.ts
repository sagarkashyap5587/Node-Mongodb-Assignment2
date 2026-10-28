// COPY CODE

/**
 * Every key the app reads from .env. Add a key here (and to IAppConfiguration) to make it
 * available through ConfigurationFactory.
 */
export const CONFIG_KEYS = [
  "PORT",
  "MONGO_DB_URL",
  "MONGO_DATABASE_NAME",
] as const;

/** Keys that must be present, otherwise the app refuses to start. */
export const REQUIRED_CONFIG_KEYS = [
  "PORT",
  "MONGO_DB_URL",
  "MONGO_DATABASE_NAME",
] as const;

export const COLLECTION_NAMES = {
  TESTING: "theaters",
};
