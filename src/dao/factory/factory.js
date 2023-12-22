import { PERSISTENCE } from "../../config/config.js";

export let Product;
export let Cart;
export let Chat;
export let User;
export let UserPass;

switch (PERSISTENCE) {
  case "MONGO":
    const { default: ProductDAO } = await import("../products.mongo.dao.js");
    const { default: CartDAO } = await import("../carts.mongo.dao.js");
    const { default: UserDAO } = await import("../users.mongo.dao.js");
    const { default: ChatDAO } = await import("../chats.mongo.dao.js");
    const { default: UserPassDAO } = await import("../userPass.mongo.dao.js");
    Product = ProductDAO;
    Cart = CartDAO;
    User = UserDAO;
    UserPass = UserPassDAO;
    Chat = ChatDAO;
    break;
  default:
    break;
}
