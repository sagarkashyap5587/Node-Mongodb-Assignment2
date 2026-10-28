import { UserModel } from "./user.schema.js";

class UserRepository {
  async create(data: { name: string; email: string; password: string }) {
    return UserModel.create(data);
  }

  async findByEmail(email: string) {
    return UserModel.findOne({ email });
  }

  async findByEmailWithPassword(email: string) {
    return UserModel.findOne({ email }).select("+password");
  }

  async findById(id: string) {
    return UserModel.findById(id);
  }

  async updateName(id: string, name: string) {
    return UserModel.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
  }
}

export const userRepository = new UserRepository();