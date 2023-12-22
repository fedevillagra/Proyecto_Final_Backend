import { PORT, STRIPE_API_KEY, RAILWAY_URL } from "../config/config.js";
import { CartService } from "../services/carts.service.js";
import { devLogger } from "../utils/logger.js";
import Stripe from "stripe";

const stripe = new Stripe(STRIPE_API_KEY);

export const createPaymentsController = async (req, res) => {
  try {
    const cartId = req?.user?.user?.cart;
    const cart = await CartService.getCart(cartId);

    const lineItems = cart.products.map((prod) => {
      const price = Math.round(prod.product.price * 100);
      return {
        price_data: {
          product_data: {
            name: prod.product.title,
            description: prod.product.description,
          },
          currency: "usd",
          unit_amount: price,
        },
        quantity: prod.quantity,
      };
    });
    
    const sessions = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      // Cambiar las url para que funcionen de manera local
      // success_url: `http://localhost:${PORT}/api/payments/success`,
      // cancel_url: `http://localhost:${PORT}/api/payments/cancel`,
      success_url: `${RAILWAY_URL}/api/payments/success`,
      cancel_url: `${RAILWAY_URL}/api/payments/cancel`,
    });
    
    return res.redirect(sessions.url);
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error.message);
  }
};

export const paymentSuccessController = async (req, res) => {
  try {
    const cartId = req?.user?.user?.cart;
    const cart = await CartService.getCart(cartId);
    res.render("payments/success", {cartId: cart._id});
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error.message);
  }
};

export const paymentCancelController = (req, res) => {
  try {
    res.render("payments/cancel");
  } catch (error) {
    devLogger.error(error);
    return res.sendServerError(error.message);
  }
};