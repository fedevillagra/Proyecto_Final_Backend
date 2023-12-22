import { cartModel } from "../models/carts.model.js";
import { ticketModel } from "../models/tickets.model.js";

export default class CartDAO {
  addCart = async (cart) => await cartModel.create(cart);
  updatedCart = async (filter, update) =>
    await cartModel.findOneAndUpdate(filter, update, { returnOriginal: false });
  getCart = async (id) => await cartModel.findById(id).lean().exec();
  deleteCart = async (id) =>
    await cartModel
      .findByIdAndUpdate(id, { products: [] }, { new: true }).lean().exec();
  create = async (cart) => await cartModel.create(cart);
  createPurchase = async (ticket) => await ticketModel.create(ticket);
  getPurchase = async (id) => await ticketModel.findById(id).lean().exec();
}
