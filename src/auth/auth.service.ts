import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
    private configService: ConfigService,
  ) {}

  private COOKIE_CONFIG = this.configService.get<{ httpOnly: boolean }>(
    'COOKIE_CONFIG',
  );
  private SSO_TOKEN_SECRET = this.configService.get<string>('SSO_TOKEN_SECRET');
  private SECRET_REFRESH = this.configService.get<string>('SECRET_REFRESH');
  private SECRET = this.configService.get<string>('SECRET');
  private SSO_TOKEN_TIME = this.configService.get<string>('SSO_TOKEN_TIME');
  private REFRESH_TOKEN_TIME =
    this.configService.get<string>('REFRESH_TOKEN_TIME');
  private ACCESS_TOKEN_TIME =
    this.configService.get<string>('ACCESS_TOKEN_TIME');

  async signinSSO(body: { SSOToken: string }, res: FastifyReply) {
    try {
      const { SSOToken } = body;
      const decoded = await jwt.verify(SSOToken, this.SSO_TOKEN_SECRET);
      if (decoded) {
        const userInfo = {
          _id: decoded._id,
          name: decoded.name,
          lastname: decoded.lastname,
        };
        const refresh = await this.createRefreshToken(userInfo);
        return res
          .status(200)
          .send(await this.createAccessToken(userInfo, refresh))
          .cookie('refreshToken', refresh, this.COOKIE_CONFIG);
      }
    } catch {
      return res.status(401).send({
        status: 'FAILURE',
        message: 'The token is not valid.',
      });
    }
  }
  async signup(
    body: { email: string; password: string; name: string; lastname: string },
    res: FastifyReply,
  ) {
    const { email, password, name, lastname } = body;
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (user) {
      return res.status(400).send({
        status: 'FAILURE',
        message: 'The user exists.',
      });
    } else {
      try {
        const hash = await new Promise((resolve, reject) => {
          bcrypt.hash(password, 10, function (err, hash) {
            if (err) reject(err);
            resolve(hash);
          });
        });
        const newUser = new User({
          email: email,
          password: hash as string,
          name: name,
          lastname: lastname,
        });
        const userSave = await this.userRepository.save(newUser);
        if (userSave) {
          return res.status(201).send({
            status: 'SUCCESSFUL',
            message: 'The user is created.',
          });
        } else {
          throw 'Server error.';
          // return res.status(500).send({
          //   status: 'FAILURE',
          //   message: 'Server error.',
          // });
        }
      } catch (error) {
        return res.status(500).send({
          status: 'FAILURE',
          message: error,
        });
      }
    }
  }
  async signin(body: { email: string; password: string }, res: FastifyReply) {
    try {
      const { email, password } = body;
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
      });
      if (!user) {
        return res.status(404).send({
          status: 'FAILURE',
          message: 'The user is not found.',
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const userInfo = {
          _id: user.id,
          name: user.name,
          lastname: user.lastname,
        };
        const refresh = await this.createRefreshToken(userInfo);
        return res
          .code(200)
          .send(await this.createAccessToken(userInfo, refresh))
          .cookie('refreshToken', refresh, this.COOKIE_CONFIG);
      } else {
        return res
          .status(400)
          .send({ status: 'FAILURE', message: 'Wrong password.' });
      }
    } catch {
      return res.status(500).send({
        status: 'FAILURE',
        message: 'Server error.',
      });
    }
  }
  async refresh(
    body: { refreshToken?: string },
    req: FastifyRequest,
    res: FastifyReply,
  ) {
    try {
      const refreshToken = req.cookies.refreshToken || body.refreshToken;
      const decoded = await jwt.verify(refreshToken, this.SECRET_REFRESH);
      if (decoded) {
        const userInfo = {
          _id: decoded._id,
          name: decoded.name,
          lastname: decoded.lastname,
        };
        const refresh = await this.createRefreshToken(userInfo);
        return res
          .status(200)
          .send(await this.createAccessToken(userInfo, refresh))
          .cookie('refreshToken', refresh, this.COOKIE_CONFIG);
      }
    } catch (err) {
      return res
        .status(500)
        .send({
          status: 'FAILURE',
          message: 'Server error.',
          // ss: refreshToken,
          err: err,
        })
        .clearCookie('refreshToken');
    }
  }
  async verify(body: { accessToken: string }, res: FastifyReply) {
    try {
      const { accessToken } = body;
      const decoded = await jwt.verify(accessToken, this.SECRET);
      if (decoded) {
        return res.status(200).send({
          status: 'SUCCESSFUL',
          message: 'The token is valid.',
        });
      }
    } catch {
      return res.status(401).send({
        status: 'FAILURE',
        message: 'The token is not valid.',
      });
    }
  }
  async logout(body: { accessToken: string }, res: FastifyReply) {
    try {
      const { accessToken } = body;
      await jwt.verify(accessToken, this.SECRET);
      return res
        .status(200)
        .send({
          status: 'SUCCESSFUL',
          message: 'User logged out.',
        })
        .clearCookie('refreshToken');
    } catch (error) {
      return res.status(401).send({
        status: 'FAILURE',
        message: 'The token is not valid.',
      });
    }
  }
  private async createSSOToken(user: any) {
    return await jwt.sign(user, this.SSO_TOKEN_SECRET, {
      expiresIn: this.SSO_TOKEN_TIME,
    });
  }
  private async createRefreshToken(user: any) {
    return await jwt.sign(user, this.SECRET_REFRESH, {
      expiresIn: this.REFRESH_TOKEN_TIME,
    });
  }
  private async createAccessToken(user: any, refresh: any) {
    return {
      ...user,
      accessToken: await jwt.sign(user, this.SECRET, {
        expiresIn: this.ACCESS_TOKEN_TIME,
      }),
      accessTokenTime: this.ACCESS_TOKEN_TIME,
      SSOToken: await this.createSSOToken(user),
      refreshToken: refresh,
    };
  }
}
