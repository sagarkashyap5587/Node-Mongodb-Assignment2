import { SessionModel } from "./session.schema.js";

class SessionRepository {
  async create(data: { userId: string; token: string; expiresAt: Date; userAgent: string }) {
    return SessionModel.create(data);
  }

  async findByToken(token: string) {
    return SessionModel.findOne({ token });
  }

  async deleteByToken(token: string) {
    return SessionModel.deleteOne({ token });
  }
}

export const sessionRepository = new SessionRepository();