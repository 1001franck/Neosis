import { User } from "../../../domain/users/entities/User.js";
import type { IUserRepository } from "../../../domain/users/repositories/UserRepository.js";
import { BaseUseCase } from "../../shared/BaseUseCase.js";
import { AppError, ErrorCode } from "../../../shared/errors/AppError.js";
import bcrypt from "bcrypt";

export interface RegisterUserDTO {
  email: string;
  username: string;
  password: string;
}

export class RegisterUserUseCase extends BaseUseCase<RegisterUserDTO, User> {
  constructor(private userRepository: IUserRepository) {
    super();
  }

  getName(): string {
    return 'RegisterUserUseCase';
  }

  async execute(data: RegisterUserDTO): Promise<User> {
    const { email, username, password } = data;

    if (!email || !username || !password) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, "Email, username et password requis", 400);
    }

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new AppError(ErrorCode.USER_ALREADY_EXISTS, "Un compte avec ces informations existe déjà", 409);
    }

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new AppError(ErrorCode.USER_ALREADY_EXISTS, "Un compte avec ces informations existe déjà", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User(
      "",
      email,
      username,
      passwordHash,
      null,
      new Date(),
      new Date(),
      null,
      null,
      null,
      null
    );

    return await this.userRepository.create(user);
  }
}