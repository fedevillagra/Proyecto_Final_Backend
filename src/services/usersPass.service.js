import { UserPass } from "../dao/factory/factory.js";
import UserPasswordRepository from "../repositories/userPass.repository.js";

export const UserPasswordService = new UserPasswordRepository(new UserPass());
