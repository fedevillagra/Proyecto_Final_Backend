import { User } from "../dao/factory/factory.js";
import UserRepository from "../repositories/user.repository.js";

export const UserService = new UserRepository(new User());
