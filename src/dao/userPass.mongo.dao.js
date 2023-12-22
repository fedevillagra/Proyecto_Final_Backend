import { userPasswordModel } from "../models/userPassword.model.js";

export default class UserPasswordDAO {
  create = async (email, token) => await userPasswordModel.create(email, token);
  findOne = async (token) => await userPasswordModel.findOne(token);
}
