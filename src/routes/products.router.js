import { uploaders } from "../middlewares/multer.js";
import {
  addProductsController,
  deleteProductsController,
  getProductsByIdController,
  getProductsController,
  updateProductsController,
} from "../controllers/products.controller.js";
import appRouter from "./router.js";

export default class ProductsRouter extends appRouter {
  init() {
    this.get("/", ["USER", "ADMIN", "PREMIUM"], getProductsController);

    this.get("/:pid", ["USER", "ADMIN", "PREMIUM"], getProductsByIdController);

    this.post("/", ["ADMIN", "PREMIUM"], uploaders, addProductsController);

    this.put("/:pid", ["ADMIN", "PREMIUM"], updateProductsController);

    this.delete("/:pid", ["ADMIN", "PREMIUM"], deleteProductsController);
  }
}
