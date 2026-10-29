import { userRepository } from "./user.repository.js";

import { userCache } from "./user.cache.js";
import { ApiError } from "../../errors/apiError.js";
import type { UserProfile, UserSchema } from "./user.interface.js";

export function toProfile(user: UserSchema): UserProfile {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

class UserService {
  async getMe(userId: string): Promise<UserProfile> {
    const cached = await userCache.getProfile(userId);
    if (cached) return cached;

    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const profile = toProfile(user);
    await userCache.setProfile(userId, profile);
    return profile;
  }

  async updateMe(userId: string, name: unknown): Promise<UserProfile> {
    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 50
    ) {
      throw new ApiError(400, "Name must be between 2 and 50 characters");
    }

    // 1) MongoDB first, 2) then invalidate the cache
    const user = await userRepository.updateName(userId, name.trim());
    if (!user) throw new ApiError(404, "User not found");
    await userCache.deleteProfile(userId);

    return toProfile(user);
  }
}

export const userService = new UserService();
