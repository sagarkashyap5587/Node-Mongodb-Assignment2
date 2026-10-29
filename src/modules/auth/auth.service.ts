import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { userRepository } from "../user/user.repository.js";
import { sessionRepository } from "../session/session.repository.js";
import { sessionCache } from "../session/session.cache.js";
import { authCache } from "./auth.cache.js";
import { toProfile } from "../user/user.service.js";
import { ApiError } from "../../errors/apiError.js";
import { AUTH_CONSTANTS } from "../../constant/constant.js";

const INVALID_LOGIN = "Invalid email or password";
// used so a wrong email takes the same time as a wrong password
const DUMMY_HASH = bcrypt.hashSync("dummy-password", AUTH_CONSTANTS.BCRYPT_ROUNDS);

class AuthService {
  async signup(body: { name?: unknown; email?: unknown; password?: unknown }) {
    const { name, email, password } = body;

    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 50) {
      throw new ApiError(400, "Name must be between 2 and 50 characters");
    }
    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      throw new ApiError(400, "A valid email is required");
    }
    if (typeof password !== "string" || password.length < 8) {
      throw new ApiError(400, "Password must be at least 8 characters");
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await userRepository.findByEmail(normalizedEmail)) {
      throw new ApiError(409, "Email already registered");
    }

    const hashed = await bcrypt.hash(password, AUTH_CONSTANTS.BCRYPT_ROUNDS);
    const user = await userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
    });
    return toProfile(user);
  }

  async login(body: { email?: unknown; password?: unknown }, userAgent: string) {
    const { email, password } = body;
    if (typeof email !== "string" || typeof password !== "string") {
      throw new ApiError(400, "Email and password are required");
    }
    const normalizedEmail = email.trim().toLowerCase();

    // 1) rate limit check BEFORE touching the password
    const fails = await authCache.getFailCount(normalizedEmail);
    if (fails >= AUTH_CONSTANTS.LOGIN_MAX_FAILS) {
      const ttl = await authCache.getTtl(normalizedEmail);
      const minutes = Math.max(1, Math.ceil(ttl / 60));
      throw new ApiError(429, `Too many login attempts. Try again in ${minutes} minutes`);
    }

    // 2) check credentials
    const user = await userRepository.findByEmailWithPassword(normalizedEmail);
    const ok = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
    if (!user || !ok) {
      await authCache.increaseFail(normalizedEmail);
      throw new ApiError(401, INVALID_LOGIN);
    }

    // 3) success -> reset counter, create session in MongoDB + Redis
    await authCache.clearFail(normalizedEmail);

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + AUTH_CONSTANTS.SESSION_DAYS * 24 * 60 * 60 * 1000);
    await sessionRepository.create({
      userId: user._id.toString(),
      token,
      expiresAt,
      userAgent,
    });
    await sessionCache.save(token, user._id.toString(), expiresAt);

    return { token, expiresAt, user: toProfile(user) };
  }

  async logout(token: string, userId: string) {
    await sessionRepository.deleteByToken(token); // MongoDB
    await sessionCache.remove(token, userId); // Redis (key + set member)
  }
}

export const authService = new AuthService();