// import type { NextFunction, Request, Response } from "express";
// import { sessionCache } from "../session/session.cache.js";
// import { sessionRepository } from "../session/session.repository.js";
// import { ApiError } from "../../errors/apiError.js";

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace Express {
//     interface Request {
//       auth?: { userId: string; token: string };
//     }
//   }
// }

// function readToken(req: Request): string | null {
//   const header = req.headers.authorization;
//   if (!header) return null;
//   const [scheme, token] = header.split(" ");
//   return scheme?.toLowerCase() === "bearer" && token ? token : null;
// }

// export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
//   try {
//     const token = readToken(req);
//     if (!token) throw new ApiError(401, "Authentication required");

//     // 1) Redis first
//     const cachedUserId = await sessionCache.getUserId(token);
//     if (cachedUserId) {
//       req.auth = { userId: cachedUserId, token };
//       return next();
//     }

//     // 2) fall back to MongoDB
//     const session = await sessionRepository.findByToken(token);
//     if (!session || session.expiresAt.getTime() <= Date.now()) {
//       throw new ApiError(401, "Invalid or expired session");
//     }

//     // 3) re-cache with the remaining TTL
//     const userId = session.userId.toString();
//     await sessionCache.save(token, userId, session.expiresAt);

//     req.auth = { userId, token };
//     next();
//   } catch (err) {
//     next(err);
//   }
// }