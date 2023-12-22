export default class ProductRepository {
  constructor(dao) {
    this.dao = dao;
  }
  getAll = async () => await this.dao.getAll();
  getAllPaginate = async (filter, options) => await this.dao.getAllPaginate(filter, options);
  getById = async (id) => await this.dao.getById(id);
  create = async (data) => await this.dao.create(data);
  update = async (id, data) => await this.dao.update(id, data, { new: true });
  delete = async (id) => await this.dao.delete(id);
}