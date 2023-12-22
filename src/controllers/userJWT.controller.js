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
  const userEmail = new UserEmailDTO(req.user);
  // Creo el email de bienvenida con los datos devueltos por dto
  await sendEmailRegister(userEmail);
  res.redirect("/api/jwt/login");
};

export const failRegisterController = (req, res) => {
  res.render("errors/errorPage", {
    status: "error",
    error: "Failed Register!",
  });
};

export const viewRegisterController = (req, res) => {
  res.render("sessions/register");
};

export const userLoginController = (req, res) => {
  // El usuario ha sido autenticado exitosamente
  const user = req.user;
  const access_token = generateToken(user);
  res
    .cookie(SIGNED_COOKIE_KEY, access_token, { signed: true })
    .redirect("/products");
};

export const failLoginController = (req, res) => {
  res.render("errors/errorPage", {
    status: "error",
    error: "Invalid Credentials",
  });
};

export const viewLoginController = (req, res) => {
  res.render("sessions/login");
};

export const loginGithubController = async (req, res) => {};

export const githubCallbackController = async (req, res) => {
  const access_token = req.authInfo.token;
  res
    .cookie(SIGNED_COOKIE_KEY, access_token, { signed: true })
    .redirect("/products");
};

export const userLogoutController = async (req, res) => {
  try {
    res.clearCookie(SIGNED_COOKIE_KEY).redirect("/api/jwt/login");
  } catch (error) {
    devLogger.error(error);
    res.render("errors/errorPage", {
      status: "error",
      error: "Error during logout",
    });
  }
};

export const errorPageController = (req, res) => {
  res.render("errors/errorPage");
};

export const errorResetPassController = (req, res) => {
  res.render("errors/errorResetPass");
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
    res.render("sessions/current", { user, users, isUser, isPremium, isAdmin });
  } catch (error) {
    devLogger.error(error);
  }
};

export const passwordResetController = (req, res) => {
  res.render("sessions/passwordResetEmail");
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
    res.render("sessions/messageEmail", {
      status: "success",
      message: `Email successfully send to ${email} in order to reset password`,
    });
  } catch (error) {
    devLogger.error(error);
  }
};

export const changePasswordController = async (req, res) => {
  const tid = req.params.tid;
  const tokenId = await UserPasswordService.findOne({ token: tid });

  if (!tokenId) {
    return res.render("errors/errorResetPass", {
      status: "error",
      error: "invalid token | token has expired",
    });
  }
  res.render("sessions/changePassword", { tid });
};

export const sendNewPasswordController = async (req, res) => {
  try {
    const tid = req.params.tid;
    if (!tid) {
      return res.render("errors/errorResetPass", {
        status: "error",
        error: "invalid token | token has expired",
      });
    }
    const userEmail = jwt.verify(tid, PRIVATE_KEY);

    const { password } = req.body;
    const userFound = await UserService.findOne({
      email: userEmail.data.email,
    });
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
    res.render("sessions/messageEmail", {
      status: "success",
      message: `Password successfully updated`,
    });
  } catch (error) {
    devLogger.error(error);
  }
};
