import {
  createProductController,
  getProductsController,
} from "../controllers/mockingproducts.controller.js";
import appRouter from "./router.js";

export default class MockingProducts extends appRouter {
  init() {
    this.get("/", ["PUBLIC"], getProductsController);

    this.post("/", ["PUBLIC"], createProductController);
  }
}
