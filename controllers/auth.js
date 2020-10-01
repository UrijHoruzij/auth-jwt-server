const UserModel = require("../models/User");
const RefreshTokenModel = require("../models/RefreshToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accessSecret = process.env.SECRET;
const accessTime = process.env.ACCESS_TOKEN_TIME;
const refreshSecret = process.env.SECRET_REFRESH;
const refreshTime = process.env.REFRESH_TOKEN_TIME;

class auth {
  async verify(req, res) {
    const { token } = req.body;
    try {
      const decoded = await jwt.verify(token, accessSecret);
      if (decoded) {
        return res.status(200).json({
          message: "Токен валидный",
          verify: true,
        });
      }
    } catch {
      return res.status(401).json({
        message: "Токен не валидный",
        verify: false,
      });
    }
  }

  issueTokenPair(userId) {
    const newRefreshToken = jwt.sign({ id: userId }, refreshSecret, {
      expiresIn: refreshTime,
    });
    const token = new RefreshTokenModel({
      user: userId,
      refresh: newRefreshToken,
    });
    token.save();
    return {
      status: "success",
      token: jwt.sign({ id: userId }, accessSecret, {
        expiresIn: accessTime,
      }),
      refreshToken: newRefreshToken,
    };
  }

  async signup(req, res) {
    const { email, password, fullname } = req.body;
    try {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        return res.status(400).json({
          message: "Пользователь существует.",
        });
      } else {
        bcrypt.hash(password, 10, async (err, hash) => {
          if (err) {
            res.status(500).json({
              message: err,
            });
          }
          const newUser = new UserModel({
            email: email,
            password: hash,
            fullname: fullname.name + " " + fullname.surname,
          });
          let userSave = await newUser.save();
          if (userSave) {
            return res.status(201).json({
              message: "Пользователь создан",
            });
          } else {
            return res.status(500).json({
              message: "Ошибка сервера",
            });
          }
        });
      }
    } catch {
      return res.status(500).json({
        message: "Ошибка сервера",
      });
    }
  }

  async signin(req, res) {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findOne({ email: email });
      if (!user) {
        return res.status(404).json({
          message: "Пользователь не найден.",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return res.status(200).json(this.issueTokenPair(user._id));
      } else {
        return res.status(400).json({ message: "Неправильный пароль." });
      }
    } catch {
      return res.status(500).json({
        message: "Ошибка сервера",
      });
    }
  }

  async refresh(req, res) {
    const { refreshToken } = req.body;
    try {
      const token = await RefreshTokenModel.findOne({ refresh: refreshToken });
      if (token) {
        token.remove();
        return res.status(200).json(this.issueTokenPair(token.user));
      } else {
        return res.status(404).json({ message: "Пользователь не найден." });
      }
    } catch {
      return res.status(500).json({
        message: "Ошибка сервера",
      });
    }
  }

  async logout(req, res) {
    const { refreshToken } = req.body;
    try {
      const tokenRemove = await RefreshTokenModel.remove({
        refresh: refreshToken,
      });
      if (tokenRemove) {
        return res.status(200).json({
          isAuth: false,
        });
      } else {
        return res.status(500).json({
          message: "Ошибка сервера",
        });
      }
    } catch (ex) {
      return res.status(500).json({
        message: "Ошибка сервера",
      });
    }
  }
}

module.exports = auth;
