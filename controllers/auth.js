const UserModel = require("../models/User");
const RefreshTokenModel = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;
const secretRefresh = process.env.SECRET_REFRESH;

class auth {
  issueTokenPair(userId) {
    const newRefreshToken = jwt.sign({ id: userId }, secretRefresh, {
      expiresIn: "7d",
    });
    const token = new RefreshTokenModel({
      user: userId,
      refresh: newRefreshToken,
    });
    token.save();
    return {
      status: "success",
      token: jwt.sign({ id: userId }, secret, { expiresIn: 600 }),
      refreshToken: newRefreshToken,
    };
  }

  signup(req, res) {
    const { email, password, fullname } = req.body;
    UserModel.findOne({ email: email }).then((user) => {
      if (user) {
        return res.status(400).json({
          message: "Пользователь существует.",
        });
      } else {
        const newUser = new UserModel({
          email: email,
          password: password,
          fullname: fullname,
        });
        bcrypt.hash(newUser.password, 10, (err, hash) => {
          if (err) {
            res.status(500).json({
              message: err,
            });
          }
          newUser.password = hash;
          newUser
            .save()
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((err) =>
              res.status(500).json({
                message: err,
              })
            );
        });
      }
    });
  }

  signin(req, res) {
    const { email, password } = req.body;
    UserModel.findOne({ email: email }).then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "Пользователь не найден.",
        });
      }
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          res.status(200).json(this.issueTokenPair(user._id));
        } else {
          res.status(400).json({ message: "Неправильный пароль." });
        }
      });
    });
  }

  refresh(req, res) {
    const { refreshToken } = req.body;
    RefreshTokenModel.findOne({ refresh: refreshToken })
      .then((token) => {
        token.remove();
        res.status(200).json(this.issueTokenPair(token.user));
      })
      .catch(() => {
        res.status(404).json({ message: "Пользователь не найден." });
      });
  }

  logout(req, res) {
    const { refreshToken } = req.body;
    RefreshTokenModel.remove({ refresh: refreshToken })
      .then(() => {
        res.status(200).json({
          isAuth: false,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: err,
        });
      });
  }
}

module.exports = auth;
