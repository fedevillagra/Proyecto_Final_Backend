import { 
  addFilesController, 
  deleteInactiveUsersController, 
  deleteUserController, 
  updatedUserRoleController 
} from "../controllers/users.controller.js";
import { uploaders } from "../middlewares/multer.js";
import appRouter from "./router.js";

export default class UsersRouter extends appRouter {
  init() {
    this.post("/premium/:uid", ["ADMIN"], updatedUserRoleController);
    this.post("/:uid/documents", ["USER", "PREMIUM", "ADMIN"], uploaders, addFilesController);
    this.delete("/inactiveUsers", ["ADMIN"], deleteInactiveUsersController);
    this.delete("/:uid", ["ADMIN"], deleteUserController);
  }
}
