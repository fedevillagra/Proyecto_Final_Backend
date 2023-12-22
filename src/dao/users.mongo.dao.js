import { userModel } from "../models/users.model.js";

export default class UserDAO {
  find = async () => await userModel.find();
  findOne = async (user) => await userModel.findOne(user);
  findById = async (id) => await userModel.findById(id).lean().exec();
  create = async (user) => await userModel.create(user);
  update = async (id, data) =>
    await userModel.findByIdAndUpdate(id, data, { new: true });
  delete = async (id) => await userModel.findByIdAndDelete(id);
  findInactiveUsers = async (data) =>
    await userModel.find({ last_connection: { $lt: data } });
}
