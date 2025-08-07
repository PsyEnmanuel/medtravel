import express from "express";
import path from "path";
import createError from "http-errors";
import http from "http";
import cors from "cors";
import apiRoutes from "../api/index.js";
import { Server } from "socket.io";
import { logError, returnError, isOperationalError } from "./errors.js";
import { httpLogger } from "../utils/logger.js";` `
import packageJson from "../../package.json" assert { type: "json" };

import { setDefaultOptions } from 'date-fns';
import { es } from "date-fns/locale";
import { sameOriginMiddleware } from "../middleware/auth.js";
setDefaultOptions({ locale: es });

const checkReferer = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const referer = req.get('Referer'); // Get the Referer header
  const allowedHost = req.get('Host'); // Get the Host header (your server's domain)

  if (referer && referer.includes(allowedHost)) {
    next(); // Request is coming from the same domain, proceed
  } else {
    res.status(403).send('Access denied: You cannot access this resource directly.');
  }
};

function createServer() {
  const app = express();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  app.use(function (req, res, next) {
    req.io = io;
    next();
  });

  const allowedOrigins = [
    'http://localhost:9000',
    'https://app.medtravel.do',
    'http://127.0.0.1:9000'
  ];

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));

  app.set("view engine", "ejs");

  app.use(express.urlencoded({ extended: false, limit: '10mb' }));
  app.use(
    "/assets",
    express.static(path.join(path.resolve(), "/client/assets"))
  );

  app.use("/privated", sameOriginMiddleware, express.static(path.join(path.resolve(), "/privated")));

  app.use(express.static(path.join(path.resolve(), "/public")));

  app.use(express.json({ limit: '10mb' }));

  app.use(httpLogger);

  app.use("/api", apiRoutes);

  app.get("*", (req, res) => {
    res.sendFile(path.join(path.resolve(), "/client/index.html"));
  });

  app.use(function (req, res, next) {
    next(createError(404));
  });

  app.use(returnError);

  process.on("unhandledRejection", (error) => {
    throw error;
  });

  process.on("uncaughtException", (error) => {
    logError(error);

    if (!isOperationalError(error)) {
      process.exit(1);
    }
  });

  server.getConnections((data) => {
    // app.emit('listened', null)
    setTimeout(() => {
      io.emit("update", {
        table: "t_version",
        version: packageJson.version,
      });
    }, 30000);
  });

  return server;
}

export default createServer;
