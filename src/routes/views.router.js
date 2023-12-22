import appRouter from "./router.js";
import { getCartViewController, getChatController, getProductsByIdViewController, getProductsViewsController, getRealTimeProductsController } from "../controllers/views.controller.js";

export default class ViewsProductsRouter extends appRouter {
  init(){
    this.get("/",["USER", "ADMIN", "PREMIUM"], getProductsViewsController);

    this.get("/realTimeProducts",["ADMIN", "PREMIUM"], getRealTimeProductsController);

    this.get("/chat",["USER", "PREMIUM"], getChatController);

    this.get("/product/:pid",["USER", "ADMIN", "PREMIUM"],
      getProductsByIdViewController
    );

    this.get("/carts/:cid",["USER", "ADMIN", "PREMIUM"], getCartViewController);
  }
}
