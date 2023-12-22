export default class CartRepository {
  constructor(dao) {
    this.dao = dao;
  }
  addCart = async (cart) => await this.dao.addCart(cart);
  getCart = async (id) => await this.dao.getCart(id);
  updatedCart = async (filter, update) => await this.dao.updatedCart(filter, update);
  deleteCart = async (id) => await this.dao.deleteCart(id);
  create = async (cart) => await this.dao.create(cart);
  createPurchase = async (ticket) => await this.dao.createPurchase(ticket);
  getPurchase = async (id) => await this.dao.getPurchase(id);
}
