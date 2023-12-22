import passport from "passport";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import jwt from "passport-jwt";
import { UserService } from "../services/users.service.js";
import { CartService } from "../services/carts.service.js";
import bcrypt from "bcrypt";
import { isValidPassword, generateToken, createHash } from "../utils/utils.js";
import {
  SIGNED_COOKIE_KEY,
  PRIVATE_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  JWT_CLIENT_ID,
  JWT_CLIENT_SECRET,
} from "./config.js";
import UserEmailDTO from "../dto/userEmail.dto.js";
import { sendEmailRegister } from "../services/nodemailer/mailer.js";
import { devLogger } from "../utils/logger.js";

const LocalStrategy = local.Strategy;

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

let token = null;
export const cookieExtractor = (req) => {
  token =
    req && req.signedCookies ? req.signedCookies[SIGNED_COOKIE_KEY] : null;
  return token;
};

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          const user = await UserService.findOne({ email: username });
          if (user) {
            return done(null, false);
          }
          const cartNewUser = await CartService.create({});
          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart: cartNewUser._id,
          };
          if (
            newUser.email === ADMIN_EMAIL &&
            bcrypt.compareSync(ADMIN_PASSWORD, newUser.password)
          ) {
            newUser.role = "admin";
          }
          const result = await UserService.create(newUser);
          return done(null, result);
        } catch (error) {
          devLogger.error(error);
          return done("Error creating user: " + error.message);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          const user = await UserService.findOne({ email: username });
          if (!user || !isValidPassword(user, password)) {
            return done(null, false);
          }
          // Actualizar solo la propiedad last_connection
          user.last_connection = new Date();
          await UserService.update(user._id, {
            last_connection: user.last_connection,
          });
          return done(null, user);
        } catch (error) {
          devLogger.error(error);
          return done("Error getting user");
        }
      }
    )
  );

  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: JWT_CLIENT_ID,
        clientSecret: JWT_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/jwt/githubcallback",
      },
      async (accessTocken, refreshToken, profile, done) => {
        try {
          // devLogger.info(profile)
          const userName = profile.displayName || profile.username;
          const userEmail = profile._json.email;

          const existingUser = await UserService.findOne({ email: userEmail });
          if (existingUser) {
            // Si el usuario ya existe en la base de datos, generamos el token
            const token = generateToken(existingUser);
            // Actualizar solo la propiedad last_connection
            user.last_connection = new Date();
            await UserService.update(user._id, {
              last_connection: user.last_connection,
            });
            // Enviamos el token como una cookie en la respuesta
            return done(null, existingUser, { token });
          }
          const cartNewUser = await CartService.create({});
          const newUser = {
            first_name: userName,
            last_name: " ",
            email: userEmail,
            password: " ",
            cart: cartNewUser._id,
          };
          if (newUser.email === ADMIN_EMAIL) {
            newUser.role = "admin";
          }
          const result = await UserService.create(newUser);
          // Filtro solo los datos necesarios para enviar por mail
          const userSendEmail = new UserEmailDTO(result);
          // Creo el email de bienvenida con los datos devueltos por dto
          await sendEmailRegister(userSendEmail);
          // Generamos el token para el nuevo usuario
          const token = generateToken(result);
          // Enviamos el token como una cookie en la respuesta
          return done(null, result, { token });
        } catch (error) {
          devLogger.error(error);
          return done("Error getting user");
        }
      }
    )
  );

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "current",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        try {
          const user = jwt_payload.user;
          if (!user) {
            // Si no se proporcionó un token, retornar un mensaje de error
            return done(null, false, { message: "No token provided" });
          }
          const existingUser = await UserService.findById(user._id);
          if (!existingUser) {
            // Si el usuario asociado al token no existe en la base de datos, retornar un mensaje de error
            return done(null, false, {
              message: "There is no user with an active session",
            });
          }
          return done(null, existingUser);
        } catch (error) {
          devLogger.error(error);
          return done(error);
        }
      }
    )
  );
};

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await UserService.findById(id);
  done(null, user);
});

export default initializePassport;
