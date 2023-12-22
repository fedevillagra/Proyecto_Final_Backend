import winston from "winston";
import { ENVIRONMENT } from "../config/config.js";
import moment from "moment";

const customLevelsOptions = {
  levels: {
    debug: 0,
    http: 1,
    info: 2,
    warning: 3,
    error: 4,
    fatal: 5,
  },
  colors: {
    debug: "white",
    http: "green",
    info: "blue",
    warning: "yellow",
    error: "magenta",
    fatal: "red",
  },
};

const createLogger = (env) => {
  if (env === "PROD") {
    return winston.createLogger({
      levels: customLevelsOptions.levels,
      transports: [
        new winston.transports.Console({
          level: "info",
          format: winston.format.combine(
            winston.format.timestamp({
              format: moment().format("DD/MM/YYYY HH:mm:ss"),
            }),
            winston.format.colorize({ colors: customLevelsOptions.colors }),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: "./logs/errors.log",
          level: "error",
          format: winston.format.combine(
            winston.format.timestamp({
              format: moment().format("DD/MM/YYYY HH:mm:ss"),
            }),
            winston.format.simple()
          ),
        }),
      ],
    });
  } else {
    return winston.createLogger({
      levels: customLevelsOptions.levels,
      transports: [
        new winston.transports.Console({
          level: "debug",
          format: winston.format.combine(
            winston.format.timestamp({
              format: moment().format("DD/MM/YYYY HH:mm:ss"),
            }),
            winston.format.colorize({ colors: customLevelsOptions.colors }),
            winston.format.simple()
          ),
        }),
      ],
    });
  }
};

export const devLogger = winston.createLogger({
  levels: customLevelsOptions.levels,
  transports: [
    new winston.transports.Console({
      level: "fatal",
      format: winston.format.combine(
        winston.format.timestamp({
          format: moment().format("DD/MM/YYYY HH:mm:ss"),
        }),
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple()
      ),
    }),
  ],
});

const logger = createLogger(ENVIRONMENT);
export default logger;
