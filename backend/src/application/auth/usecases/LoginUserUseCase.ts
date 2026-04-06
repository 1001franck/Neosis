import type { IUserRepository } from "../../../domain/users/repositories/UserRepository.js";
import type { User } from "../../../domain/users/entities/User.js";
import { BaseUseCase } from "../../shared/BaseUseCase.js";
import { AppError, ErrorCode } from "../../../shared/errors/AppError.js";
import bcrypt from "bcrypt";

export interface LoginUserDTO {
  email: string;
  password: string;
}

export class LoginUserUseCase extends BaseUseCase<LoginUserDTO, User> {
  constructor(private userRepository: IUserRepository) {
    super();
  }

  getName(): string {
    return 'LoginUserUseCase';
  }

  async execute(data: LoginUserDTO): Promise<User> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, "Identifiants invalides", 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, "Identifiants invalides", 401);
    }

    return user;
  }
}