import messageModel from "../models/messages.model.js";

export default class ChatDAO {
  getMessages = async () => await messageModel.find().lean().exec();
}