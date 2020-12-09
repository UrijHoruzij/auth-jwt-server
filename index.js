const express = require("express");
const cors = require("cors");
const passport = require("passport");
const morgan = require("morgan");
const os = require("os");
const cluster = require("cluster");
const cookieParser = require('cookie-parser')
const db = require("./core/db");
require("dotenv").config();

const server = () => {
  const app = express();
  db.connect();
  app.use(
    morgan((tokens, req, res) => {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, "content-length"),
        "-",
        tokens["response-time"](req, res),
        "ms",
        process.pid,
        "id",
      ].join(" ");
    })
  );

  app.use(passport.initialize());
  require("./core/passport-config")(passport);
  app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000']
  }));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cookieParser())

  const authClass = require("./controllers/auth");
  const auth = new authClass();

  app.post("/signup", (req, res) => {
    auth.signup(req, res);
  });
  app.post("/signin", (req, res) => {
    auth.signin(req, res);
  });
  app.post("/refresh", (req, res) => {
    auth.refresh(req, res);
  });
  app.post(
    "/verify",
    passport.authenticate("jwt"),
    (req, res) => {
      auth.verify(req, res);
    }
  );
  app.post(
    "/logout",
    passport.authenticate("jwt"),
    (req, res) => {
      auth.logout(req, res);
    }
  );
  app.listen(process.env.PORT, () => {
    console.log(`The server is running: ${process.env.PORT} stream ${process.pid}`);
  });
};

const clusterWorkerSize = os.cpus().length;
if (clusterWorkerSize > 1) {
  if (cluster.isMaster) {
    for (let i = 0; i < clusterWorkerSize - 1; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker) => {
      console.log("Worker", worker.id, " has exitted.");
      cluster.fork();
    });
  } else {
    server();
  }
} else {
  server();
}
