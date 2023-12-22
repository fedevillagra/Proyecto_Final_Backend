export default class UserPasswordRepository {
  constructor(dao) {
    this.dao = dao;
  }
  create = async (email, token) => await this.dao.create(email, token);
  findOne = async (token) => await this.dao.findOne(token);
}