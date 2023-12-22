import appRouter from "./router.js";
import {
  addCartController,
  addProductToCartController,
  deleteCartController,
  deleteProductInCartController,
  getCartController,
  getPurchaseController,
  updateProductToCartController,
  updatedCartController,
} from "../controllers/carts.controller.js";

export default class CartsRouter extends appRouter {
  init() {
    this.post("/", ["USER", "ADMIN", "PREMIUM"], addCartController);

    this.post("/:cid/product/:pid", ["USER", "PREMIUM"], addProductToCartController);

    this.get("/:cid", ["USER", "ADMIN", "PREMIUM"], getCartController);

    this.put("/:cid/product/:pid", ["USER", "ADMIN", "PREMIUM"], updateProductToCartController);

    this.put("/:cid", ["USER", "ADMIN", "PREMIUM"], updatedCartController);

    this.delete("/:cid", ["USER", "ADMIN", "PREMIUM"], deleteCartController);

    this.delete("/:cid/product/:pid", ["USER", "PREMIUM"], deleteProductInCartController);

    this.get("/:cid/purchase", ["USER", "PREMIUM"], getPurchaseController);
  }
}
