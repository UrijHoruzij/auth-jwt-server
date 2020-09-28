const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");
const morgan = require("morgan");
const db = require("./core/db");
require("dotenv").config();

db.connect();
app.use(morgan("tiny"));
app.use(passport.initialize());
require("./core/passport-config")(passport);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    auth.verify(req, res);
  }
);
app.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    auth.logout(req, res);
  }
);

app.listen(process.env.PORT, () => {
  console.log(`Сервер запущен: ${process.env.PORT}`);
});
