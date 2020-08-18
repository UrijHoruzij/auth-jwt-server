const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const db = require("./core/db");
const multer = require("./core/multer");
require("dotenv").config();

db.connect();

app.use(passport.initialize());
require("./core/passport-config")(passport);

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authClass = require("./controllers/auth");
const auth = new authClass();

app.post("/user/signup", (req, res) => {
  auth.signup(req, res);
});
app.post("/user/signin", (req, res) => {
  auth.signin(req, res);
});
app.post("/user/refresh", (req, res) => {
  auth.refresh(req, res);
});
app.post(
  "/user/logout",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    auth.logout(req, res);
  }
);

const uploadClass = require("./controllers/upload");
const upload = new uploadClass();

app.post("/files", multer.single("file"), (req, res) => {
  upload.create(req, res);
});
app.delete("/files", (req, res) => {
  upload.delete(req, res);
});

app.listen(process.env.PORT, () => {
  console.log(`Server run: ${process.env.PORT}`);
});
