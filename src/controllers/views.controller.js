import { ProductService, getProductsService } from "../services/products.service.js";
import { CartService } from "../services/carts.service.js";
import { ChatService } from "../services/chats.service.js";
import { devLogger } from "../utils/logger.js";

export const getProductsViewsController = async (req, res) => {
  try {
    const products = await getProductsService(req);

    // Verificar el stock de cada producto y ajustar su status
    for (const product of products.payload) {
      product.stock === 0 ? product.status = false : product.status = true
      // Actualizar status del producto en la base de datos
      await ProductService.update(product._id, { status: product.status });
    }
    // Variables para mostrar u ocultar botones de acciones en la vista
    const user = req.user.user;
    let userAdmin;
    let onlyUser;
    let userPremium;
    if (user) {
      userAdmin = user?.role === "admin" ? true : false;
      onlyUser = (user?.role === "user" || user?.role === "premium") ? true : false;
      userPremium = user?.role === "premium" ? true : false;
    }
    
    res.render("products", { products, user, userAdmin, onlyUser, userPremium });
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error);
  }
};

export const getRealTimeProductsController = async (req, res) => {
  try {
    const result = await getProductsService(req);
    const allProducts = result.payload;
    res.render("realTimeProducts", { allProducts: allProducts });
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error);
  }
};

export const getChatController = async (req, res) => {
  try {
    const messages = await ChatService.getMessages();
    res.render("chat", { messages });
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error);
  }
};

export const getProductsByIdViewController = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await ProductService.getById(pid);
    if (!product) return res.render("errors/errorPage", {error: "The product does not exist"});
    const user = req.user.user;
    let userAdmin;
    let onlyUser;
    let userPremium;
    if (user) {
      userAdmin = user?.role === "admin" ? true : false;
      onlyUser = (user?.role === "user" || user?.role === "premium") ? true : false;
      userPremium = user?.role === "premium" ? true : false;
    }
    res.render("product", { product, user, userAdmin, onlyUser, userPremium });
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error.message);
  }
};

export const getCartViewController = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await CartService.getCart(cid);
    if (cart.status === "error") return res.sendRequestError(cart.message);
    if (cart === null || cart.products.length === 0) {
      const emptyCart = "Cart Empty";
      req.app.get("socketio").emit("updatedCarts", cart.products);
      return res.render("carts", { emptyCart });
    }
    const carts = cart.products;
    req.app.get("socketio").emit("updatedCarts", carts);
    
    res.render("carts", { carts });
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error);
  }
};
