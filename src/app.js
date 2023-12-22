import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import { __dirname, dateHelper } from "./utils/utils.js";
import {
  PORT,
  SECRET_PASS,
  MONGO_URI,
  MONGO_DB_NAME,
} from "./config/config.js";
import run from "./run.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import { devLogger } from "./utils/logger.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Ecommerce Proyecto Final de Coderhouse",
      description: "API to manage products and shopping carts",
      version: "1.0.0",
    },
  },
  apis: ["./docs/**/*.yaml"],
};
const specs = swaggerJSDoc(swaggerOptions);
app.use("/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

// Configurar el middleware para servir archivos estáticos desde la carpeta "public"
app.use(express.static(`${__dirname}/public`));
// Configurar el motor de plantillas Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    helpers: dateHelper,
  })
);
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.use(cookieParser(SECRET_PASS));
initializePassport();
app.use(passport.initialize());

try {
  await mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME}`);
  // Iniciar el servidor HTTP
  const serverHttp = app.listen(
    PORT,
    () => console.log(__dirname),
    devLogger.http(`Server listening on port http://localhost:${PORT}`)
  );
  // Crear una instancia de Socket.IO y vincularla al servidor HTTP
  const io = new Server(serverHttp);
  // Establecer el objeto "socketio" en la aplicación para que esté disponible en todas las rutas
  app.set("socketio", io);

  run(io, app);
} catch (error) {
  devLogger.error(`Cannot connect to dataBase: ${error}`);
  process.exit();
}
