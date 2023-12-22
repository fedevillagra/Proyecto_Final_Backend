import { productModel } from "../models/products.model.js";

export default class ProductDAO {
  getAll = async () => await productModel.find().lean().exec();
  getAllPaginate = async (filter, options) => await productModel.paginate(filter, options);
  getById = async (id) => await productModel.findById(id).lean().exec();
  create = async (data) => await productModel.create(data);
  update = async (id, data) =>
    await productModel.findByIdAndUpdate(id, data, { new: true });
  delete = async (id) => await productModel.findByIdAndDelete(id);
}
