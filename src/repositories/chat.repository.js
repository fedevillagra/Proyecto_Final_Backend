export default class ChatRepository {
  constructor(dao) {
    this.dao = dao;
  }
  getMessages = async () => await this.dao.getMessages();
}