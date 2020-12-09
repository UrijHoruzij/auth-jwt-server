const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accessSecret = process.env.SECRET;
const accessTime = process.env.ACCESS_TOKEN_TIME;
const refreshSecret = process.env.SECRET_REFRESH;
const refreshTime = process.env.REFRESH_TOKEN_TIME;
const ssoTokenSecret = process.env.SSO_TOKEN_SECRET;
const ssoTokenTime = process.env.SSO_TOKEN_TIME;

class auth {
  async verify(req, res) {
    const { accessToken } = req.body;
    try {
      const decoded = await jwt.verify(accessToken, accessSecret);
      if (decoded) {
        return res.status(200).json({
          message: "The token is valid",
          verify: true,
        });
      }
    } catch {
      return res.status(401).json({
        message: "The token is not valid",
        verify: false,
      });
    }
  }

  createAsseccToken(userId){
    return {
      isAuth: true,
      accessToken: jwt.sign({ id: userId }, accessSecret, {
        expiresIn: accessTime,
      }),
      accessTokenTime: accessTime,
      SSOToken: this.createSSOToken(userId)
    };
  }

  createRefreshToken(userId) {
    const refreshToken = jwt.sign({ id: userId }, refreshSecret, {
      expiresIn: refreshTime,
    });
    return refreshToken;
  }

  createSSOToken(userId){
    return jwt.sign({ id: userId }, ssoTokenSecret, {
        expiresIn: ssoTokenTime,
      });
  }

  async signup(req, res) {
    const { email, password, name, lastname } = req.body;
    try {
      const user = await UserModel.findOne({ email: email });
      if (user) {
        return res.status(400).json({
          message: "The user exists.",
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
            name: name,
            lastname: lastname,
          });
          let userSave = await newUser.save();
          if (userSave) {
            return res.status(201).json({
              message: "The user is created",
            });
          } else {
            return res.status(500).json({
              message: "Server error",
            });
          }
        });
      }
    } catch {
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  async signin(req, res) {
    const { email, password } = req.body;
    try {
      const user = await UserModel.findOne({ email: email });
      if (!user) {
        return res.status(404).json({
          message: "The user is not found.",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.cookie('refreshToken', this.createRefreshToken(user._id),{ httpOnly : true} )
        return res.status(200).json(this.createAsseccToken(user._id));
      } else {
        return res.status(400).json({ message: "Wrong password." });
      }
    } catch {
      return res.status(500).json({
        message: "Server error",
      });
    }
  }

  async refresh(req, res) {
    const { refreshToken } = req.cookies;
    try {
      const decoded = await jwt.verify(refreshToken, refreshSecret);
      if (decoded) {
        res.cookie('refreshToken', this.createRefreshToken(decoded.id),{ httpOnly : true} )
        return res.status(200).json(this.createAsseccToken(decoded.id))
      }
    } catch {
      res.clearCookie('refreshToken');
      return res.status(500).json({
        isAuth: false,
        message: "Server error",
      });
    }
  }

  async logout(req, res) {
    return res.clearCookie('refreshToken')
      .status(200).json({
        isAuth: false,
    });
  }
}

module.exports = auth;
