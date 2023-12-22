import { loggerTestController } from "../controllers/loggerTest.controller.js";
import appRouter from "./router.js";

export default class LoggerTest extends appRouter {
  init() {
    this.get("/", ["PUBLIC"], loggerTestController);
  }
}
