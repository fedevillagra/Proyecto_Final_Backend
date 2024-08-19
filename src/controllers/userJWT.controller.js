import { createHash, generateToken, isValidPassword } from "../utils/utils.js";
import { PRIVATE_KEY, SIGNED_COOKIE_KEY } from "../config/config.js";
import UserDTO from "../dto/users.dto.js";
import UserEmailDTO from "../dto/userEmail.dto.js";
import {
  sendEmailRegister,
  emailResetPassword,
} from "../services/nodemailer/mailer.js";
import { UserService } from "../services/users.service.js";
import { UserPasswordService } from "../services/usersPass.service.js";
import jwt from "jsonwebtoken";
import { linkToken } from "../utils/utils.js";
import { devLogger } from "../utils/logger.js";

export const userRegisterController = async (req, res) => {
  // Filtro solo los datos necesarios para enviar por mail
  try {
    const userEmail = new UserEmailDTO(req.user);
    console.log('User data on registration:', req.user);
    // Creo el email de bienvenida con los datos devueltos por dto
    await sendEmailRegister(userEmail);
    console.log("Sending registration email to:", userEmail);
    devLogger.debug(`User data: ${JSON.stringify(req.user)}`);
    devLogger.debug(`UserEmailDTO data: ${JSON.stringify(userEmail)}`);
    return res.redirect("/api/jwt/login");
  } catch (error) {
    console.error('Error during user registration:', error.message);
    devLogger.error(`Failed to register user: ${error.message}`, { error });
    res.status(500).json({ error: { message: "Failed to register user", details: error.message } });
  }
};

export const failRegisterController = (req, res) => {
  return res.render("errors/errorPage", {
    status: "error",
    error: "Failed Register!",
  });
};

export const viewRegisterController = (req, res) => {
  return res.render("sessions/register");
};

export const userLoginController = (req, res) => {
  // El usuario ha sido autenticado exitosamente
  const user = req.user;
  const access_token = generateToken(user);
  return res
    .cookie(SIGNED_COOKIE_KEY, access_token, { signed: true })
    .redirect("/products");
};

export const failLoginController = (req, res) => {
  return res.render("errors/errorPage", {
    status: "error",
    error: "Invalid Credentials",
  });
};

export const viewLoginController = (req, res) => {
  return res.render("sessions/login");
};

export const loginGithubController = async (req, res) => {};

export const githubCallbackController = async (req, res) => {
  const access_token = req.authInfo.token;
  return res
    .cookie(SIGNED_COOKIE_KEY, access_token, { signed: true })
    .redirect("/products");
};

export const userLogoutController = async (req, res) => {
  try {
    return res.clearCookie(SIGNED_COOKIE_KEY).redirect("/api/jwt/login");
  } catch (error) {
    devLogger.error(error);
    return res.render("errors/errorPage", {
      status: "error",
      error: "Error during logout",
    });
  }
};

export const errorPageController = (req, res) => {
  return res.render("errors/errorPage");
};

export const errorResetPassController = (req, res) => {
  return res.render("errors/errorResetPass");
};

export const userCurrentController = async (req, res) => {
  try {
    const findUsers = await UserService.find();
    const allUsers = findUsers.map((user) => new UserDTO(user));
    const users = allUsers.filter((user) => user.role !== "admin");

    const user = new UserDTO(req.user);
    const isAdmin = user.role === "admin" ? true : false;
    const isUser = user.role === "user" ? true : false;
    const isPremium = user.role === "premium" ? true : false;
    return res.render("sessions/current", { user, users, isUser, isPremium, isAdmin });
  } catch (error) {
    devLogger.error(error);
    return res.status(500).render("errors/errorPage", {
      status: "error",
      error: "Error retrieving user data",
    });
  }
};

export const passwordResetController = (req, res) => {
  return res.render("sessions/passwordResetEmail");
};
export const passwordResetEmailController = async (req, res) => {
  try {
    const { email } = req.body;
    const userFound = await UserService.findOne({ email: email });

    if (!userFound) {
      return res.render("errors/errorResetPass", {
        status: "error",
        error: "Invalid Email",
      });
    }
    const userEmail = new UserEmailDTO(userFound);
    const token = linkToken(userEmail);
    await UserPasswordService.create({ email, token });
    await emailResetPassword(userEmail, token);
    return res.render("sessions/messageEmail", {
      status: "success",
      message: `Email successfully send to ${email} in order to reset password`,
    });
  } catch (error) {
    devLogger.error(error);
    return res.status(500).render("errors/errorPage", {
      status: "error",
      error: "Error sending reset email",
    });
  }
};

export const changePasswordController = async (req, res) => {
  try {
    const tid = req.params.tid;
    const tokenId = await UserPasswordService.findOne({ token: tid });

    if (!tokenId) {
      return res.render("errors/errorResetPass", {
        status: "error",
        error: "Invalid token | token has expired",
      });
    }

    return res.render("sessions/changePassword", { tid });
  } catch (error) {
    devLogger.error(error);
    return res.status(500).render("errors/errorPage", {
      status: "error",
      error: "Error processing password change",
    });
  }
};

export const sendNewPasswordController = async (req, res) => {
  try {
    const tid = req.params.tid;

    if (!tid) {
      return res.render("errors/errorResetPass", {
        status: "error",
        error: "Invalid token | token has expired",
      });
    }

    const userEmail = jwt.verify(tid, PRIVATE_KEY);
    const { password } = req.body;
    const userFound = await UserService.findOne({ email: userEmail.data.email });

    if (!userFound || isValidPassword(userFound, password)) {
      return res.render("errors/errorChangePass", {
        status: "error",
        error: "Error updating password",
        tid,
      });
    }

    const userUpdated = await UserService.update(userEmail.data._id, {
      password: createHash(password),
    });

    if (!userUpdated) {
      return res.render("errors/errorChangePass", {
        status: "error",
        error: "Error updating password",
        tid,
      });
    }

    return res.render("sessions/messageEmail", {
      status: "success",
      message: `Password successfully updated`,
    });
  } catch (error) {
    devLogger.error(error);
    return res.status(500).render("errors/errorPage", {
      status: "error",
      error: "Error processing password change",
    });
  }
};
