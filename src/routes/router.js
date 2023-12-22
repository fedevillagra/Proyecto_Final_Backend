import { Router } from "express";
import jwt from "jsonwebtoken";
import { PRIVATE_KEY, SIGNED_COOKIE_KEY } from "../config/config.js";
import { cookieExtractor } from "../config/passport.config.js";
import { devLogger } from "../utils/logger.js";

export default class appRouter {
  constructor() {
    this.router = Router();
    this.init();
  }
  getRouter() {
    return this.router;
  }
  init() {} // Esta inicializacion sera para sus clases heredadas

  get(path, policies, ...callbacks) {
    this.router.get(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }
  post(path, policies, ...callbacks) {
    this.router.post(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }
  put(path, policies, ...callbacks) {
    this.router.put(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }
  delete(path, policies, ...callbacks) {
    this.router.delete(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponses,
      this.applyCallbacks(callbacks)
    );
  }

  applyCallbacks(callbacks) {
    // mapeamos los callbacks 1 a 1, obteniendo sus parametros a partir de ...
    return callbacks.map((callback) => async (...params) => {
      try {
        // apply, ejecutara la funcion callback apuntando dirtectamente a una
        // instancia de la clase, por ello, colocamos this para que se utilice
        // solo el contexto de este router, los parametros son internos de cada
        // callback, sabemos que los params de un callback corresponden a req,res,next
        await callback.apply(this, params);
      } catch (error) {
        devLogger.error(error);
        // params[1] hace referencia a res, por ello puedo mandar un sende desde este
        params[1].status(500).json({ error });
      }
    });
  }

  generateCustomResponses = (req, res, next) => {
    // sendSuccess permitira que el desarrollador solo tenga que enviar el
    // payload, el formato se gestionara de manera interna
    res.sendSuccess = (payload) => res.json({ status: "success", payload });
    res.createdSuccess = (payload) =>
      res.status(201).json({ status: "success", payload });
    res.sendNoContent = (payload) =>
      res.status(204).json({ status: "success", payload });
    res.sendServerError = (error) =>
      res.status(500).json({ status: "error", error });
    res.sendUserError = (error) =>
      res.status(400).json({ status: "error", error });
    res.authFailError = (error) =>
      res.status(401).json({ status: "error", error });
    res.sendRequestError = (error) =>
      res.status(404).json({ status: "error", error });
    next();
  };

  handlePolicies = (policies) => (req, res, next) => {
    if (policies[0] === "PUBLIC") return next(); //Cualquiera puede entrar
    const authHeaders = req.signedCookies[SIGNED_COOKIE_KEY];
    if (!authHeaders)
      return res.status(401).render("errors/errorPage", {
        status: "error",
        error: "Unauthorized",
      });
    // json({status:"error",error:"Unauthorized"});
    const token = cookieExtractor(req);
    // Obtenemos el usuario a partir del token;
    let user = jwt.verify(token, PRIVATE_KEY);
    // ¿El rol del usuario existe dentro del arreglo de políticas?
    if (!policies.includes(user.user.role.toUpperCase()))
      return res.status(403).render("errors/errorPage", {
        status: "error",
        error: "No authorized",
      });
    // json({status:"error", error:"No authorized"});
    req.user = user;
    next();
  };
}
