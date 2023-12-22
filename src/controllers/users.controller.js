import { sendAccountDeletedEmail } from "../services/nodemailer/mailer.js";
import { UserService } from "../services/users.service.js";
import UserDTO from "../dto/users.dto.js";
import { devLogger } from "../utils/logger.js";

export const updatedUserRoleController = async (req, res) => {
  try {
    const uid = req.params.uid;
    const user = await UserService.findById(uid);

    // Verificar si el usuario tiene la propiedad "documents" y crearla si no existe.
    if (!user.documents) {
      user.documents = [];
      user.status = false;
      await UserService.update(uid, user);
    }

    if (!user) {
      return res.sendRequestError("User not found");
    }

    if (user.role === "admin") {
      return res.sendUserError("Admins cannot change user roles.");
    }

    if (user.role === "premium") {
      // Si el usuario actual es "premium", no aplicar restricciones, permitir cambiar a "user".
      user.role = "user";
    } else {
      if (user.status !== true) {
        devLogger.error("User has not completed document processing");
        return res.sendRequestError(
          "User has not completed document processing"
        );
      }
      user.role = "premium";
    }

    const updatedUser = await UserService.update(uid, user);

    res.sendSuccess(updatedUser);
  } catch (error) {
    devLogger.error(error.message);
    res.sendServerError(error.message);
  }
};

export const addFilesController = async (req, res) => {
  try {
    if (!req.files) {
      devLogger.info("No image");
    }

    const uid = req.params.uid;
    const user = await UserService.findById(uid);
    if (!user) return res.sendRequestError("User not found");

    // Verificar si el usuario tiene la propiedad "documents" y crearla si no existe.
    if (!user.documents) {
      user.documents = [];
      user.status = false;
    }
    // Verificar el tipo de archivo (perfil, producto, documento).
    const { fileType } = req.body;
    if (fileType === "profile") {
      user.profilePicture = req?.files[0]?.originalname;
    }
    if (fileType === "document") {
      user.documents.push({
        name: req.files[0].originalname,
        reference: req.files[0].originalname,
      });
      // Actualizar el estado a true cuando se carga un documento.
      user.status = true;
    }
    await UserService.update(uid, user);
    res.redirect("/api/jwt/current");
  } catch (error) {
    devLogger.error(error.message);
    res.sendServerError(error.message);
  }
};

export const deleteUserController = async (req, res) => {
  try {
    const uid = req.params.uid;
    const findUser = await UserService.findById(uid);
    if (findUser) {
      const user = new UserDTO(findUser);
      await sendAccountDeletedEmail(user);
    }
    await UserService.delete(uid);
    res.sendSuccess("User is delete");
  } catch (error) {
    devLogger.error(error.message);
    res.sendServerError(error.message);
  }
};

export const deleteInactiveUsersController = async (req, res) => {
  try {
    const currentDate = new Date();
    const twoDaysAgo = new Date(currentDate);
    twoDaysAgo.setDate(currentDate.getDate() - 2);
    /* const thirtyMinutesAgo = new Date(currentDate);
    thirtyMinutesAgo.setMinutes(currentDate.getMinutes() - 30); */
    const findInactiveUsers = await UserService.findInactiveUsers(twoDaysAgo);
    const users = findInactiveUsers.map((user) => new UserDTO(user));
    const inactiveUsers = users.filter((user) => user.role !== "admin");
    // Eliminar usuarios inactivos
    if (inactiveUsers.length > 0) {
      for (const user of inactiveUsers) {
        if (user.role !== "admin") {
          await UserService.delete(user.id);
          // Envio del correo de notificación
          await sendAccountDeletedEmail(user);
        }
      }
      res.sendSuccess("Inactive users have been cleaned up.");
    } else {
      res.sendNoContent("No inactive users to clean up.");
    }
  } catch (error) {
    devLogger.error(error.message);
    res.sendServerError(error.message);
  }
};
