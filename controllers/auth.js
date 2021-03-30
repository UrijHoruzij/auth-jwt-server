const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  SECRET, 
  ACCESS_TOKEN_TIME,
  SECRET_REFRESH,
  REFRESH_TOKEN_TIME,
  SSO_TOKEN_SECRET,
  SSO_TOKEN_TIME,
  COOKIE_CONFIG
} = require("../config");

class auth {
  createAsseccToken(user, refresh){
    return {
      ...user,
      isAuth: true,
      accessToken: jwt.sign(user, SECRET, {
        expiresIn: ACCESS_TOKEN_TIME,
      }),
      accessTokenTime: ACCESS_TOKEN_TIME,
      SSOToken: this.createSSOToken(user),
      refreshToken: refresh
    };
  }

  createRefreshToken(user) {
    const refreshToken = jwt.sign(user, SECRET_REFRESH, {
      expiresIn: REFRESH_TOKEN_TIME,
    });
    return refreshToken;
  }

  createSSOToken(user){
    return jwt.sign(user, SSO_TOKEN_SECRET, {
        expiresIn: SSO_TOKEN_TIME,
      });
  }

  async verify(req, res) {
    try {
      const { accessToken } = req.body;
      const decoded = await jwt.verify(accessToken, SECRET);
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
  
  async signinSSO(req,res) {
    try {
      const { SSOToken } = req.body;
      const decoded = await jwt.verify(SSOToken, SSO_TOKEN_SECRET);
      if (decoded) {
        const userInfo = {
          id: decoded.id,
          name: decoded.name,
          lastname: decoded.lastname,
        }
        let refresh = this.createRefreshToken(userInfo);
        res.cookie('refreshToken', refresh, COOKIE_CONFIG )
        return res.status(200).json(this.createAsseccToken(userInfo,refresh));
      }
    } catch {
      return res.status(401).json({
        message: "The token is not valid",
      });
    }
  }

  async signup(req, res) {
    try {
      const { email, password, name, lastname } = req.body;
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
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email: email });
      if (!user) {
        return res.status(404).json({
          message: "The user is not found.",
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const userInfo = {
          id: user._id,
          name: user.name,
          lastname: user.lastname,
        }
        let refresh = this.createRefreshToken(userInfo);
        res.cookie('refreshToken', refresh, COOKIE_CONFIG )
        return res.status(200).json(this.createAsseccToken(userInfo, refresh));
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
    try {
      const { refreshToken } = req.cookies || req.body;
      const decoded = await jwt.verify(refreshToken, SECRET_REFRESH);
      if (decoded) {
        const userInfo = {
          id: decoded.id,
          name: decoded.name,
          lastname: decoded.lastname,
        }
        let refresh = this.createRefreshToken(userInfo);
        res.cookie('refreshToken', refresh, COOKIE_CONFIG )
        return res.status(200).json(this.createAsseccToken(userInfo, refresh))
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
    try {
      const accessToken = req.headers.accesstoken;
      await jwt.verify(accessToken, SECRET);
      return res.clearCookie('refreshToken')
      .status(200).json({
        isAuth: false,
    });
    } catch {
      return res.status(401).json({
        message: "The token is not valid",
      });
    }
  }
}

module.exports = auth;