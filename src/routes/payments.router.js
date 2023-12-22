import appRouter from "./router.js";
import {
  createPaymentsController,
  paymentSuccessController,
  paymentCancelController,
} from "../controllers/payments.controller.js";

export default class PaymentsRouter extends appRouter {
  init() {
    this.get("/createCheckout", ["USER", "PREMIUM"], createPaymentsController);
    this.get("/success", ["USER", "PREMIUM"], paymentSuccessController);
    this.get("/cancel", ["USER", "PREMIUM"], paymentCancelController);
  }
}
