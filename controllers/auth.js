const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
	SECRET,
	ACCESS_TOKEN_TIME,
	SECRET_REFRESH,
	REFRESH_TOKEN_TIME,
	SSO_TOKEN_SECRET,
	SSO_TOKEN_TIME,
	COOKIE_CONFIG,
} = require('../config.js');

/**
 * @module auth
 */

/**
 * Class function auth
 */
class auth {
	/**
	 * Create a auth
	 * @constructor
	 */
	constructor(database) {
		this.database = database;
	}
	/**
	 * createAsseccToken
	 * @param {object} user - User info
	 * @param {string} refresh - refresh token
	 * @returns {object} User info
	 */
	createAsseccToken(user, refresh) {
		return {
			...user,
			accessToken: jwt.sign(user, SECRET, {
				expiresIn: ACCESS_TOKEN_TIME,
			}),
			accessTokenTime: ACCESS_TOKEN_TIME,
			SSOToken: this.createSSOToken(user),
			refreshToken: refresh,
		};
	}
	/**
	 * createRefreshToken
	 * @param {object} user - User info
	 * @returns {string} refresh token
	 */
	createRefreshToken(user) {
		const refreshToken = jwt.sign(user, SECRET_REFRESH, {
			expiresIn: REFRESH_TOKEN_TIME,
		});
		return refreshToken;
	}
	/**
	 * createSSOToken
	 * @param {object} user - User info
	 * @returns {string} SSO token
	 */
	createSSOToken(user) {
		return jwt.sign(user, SSO_TOKEN_SECRET, {
			expiresIn: SSO_TOKEN_TIME,
		});
	}
	/**
	 * verify
	 * @param {object} req - request
	 * @param {object} res - response
	 * @returns {object}
	 */
	async verify(req, res) {
		try {
			const { accessToken } = req.body;
			const decoded = await jwt.verify(accessToken, SECRET);
			if (decoded) {
				return res.code(200).send({
					status: 'SUCCESSFUL',
					message: 'The token is valid.',
				});
			}
		} catch {
			return res.code(401).send({
				status: 'FAILURE',
				message: 'The token is not valid.',
			});
		}
	}

	/**
	 * signinSSO
	 * @param {object} req - request
	 * @param {object} res - response
	 * @returns {object}
	 */
	async signinSSO(req, res) {
		try {
			const { SSOToken } = req.body;
			const decoded = await jwt.verify(SSOToken, SSO_TOKEN_SECRET);
			if (decoded) {
				const userInfo = {
					_id: decoded._id,
					name: decoded.name,
					lastname: decoded.lastname,
				};
				let refresh = this.createRefreshToken(userInfo);
				res.cookie('refreshToken', refresh, COOKIE_CONFIG);
				return res.code(200).send(this.createAsseccToken(userInfo, refresh));
			}
		} catch {
			return res.code(401).send({
				status: 'FAILURE',
				message: 'The token is not valid.',
			});
		}
	}
	/**
	 * signup
	 * @param {object} req - request
	 * @param {object} res - response
	 * @returns {object}
	 */
	async signup(req, res) {
		const { email, password, name, lastname } = req.body;
		const user = await this.database.checkExistUser(email);
		if (user) {
			return res.code(400).send({
				status: 'FAILURE',
				message: 'The user exists.',
			});
		} else {
			bcrypt.hash(password, 10, async (err, hash) => {
				if (err) {
					res.code(500).send({
						status: 'FAILURE',
						message: err,
					});
				}
				const newUser = {
					email: email,
					password: hash,
					name: name,
					lastname: lastname,
				};
				let userSave = await this.database.addUser(newUser);
				if (userSave) {
					return res.code(201).send({
						status: 'SUCCESSFUL',
						message: 'The user is created.',
					});
				} else {
					return res.code(500).send({
						status: 'FAILURE',
						message: 'Server error.',
					});
				}
			});
		}
		try {
		} catch {
			return res.code(500).send({
				status: 'FAILURE',
				message: 'Server error.',
			});
		}
	}
	/**
	 * signin
	 * @param {object} req - request
	 * @param {object} res - response
	 * @returns {object}
	 */
	async signin(req, res) {
		try {
			const { email, password } = req.body;
			const user = await this.database.checkExistUser(email);
			if (!user) {
				return res.code(404).send({
					status: 'FAILURE',
					message: 'The user is not found.',
				});
			}
			const isMatch = await bcrypt.compare(password, user.password);
			if (isMatch) {
				const userInfo = {
					_id: user._id,
					name: user.name,
					lastname: user.lastname,
				};
				let refresh = this.createRefreshToken(userInfo);
				res.cookie('refreshToken', refresh, COOKIE_CONFIG);
				return res.code(200).send(this.createAsseccToken(userInfo, refresh));
			} else {
				return res.code(400).send({ status: 'FAILURE', message: 'Wrong password.' });
			}
		} catch {
			return res.code(500).send({
				status: 'FAILURE',
				message: 'Server error.',
			});
		}
	}
	/**
	 * refresh
	 * @param {object} req - request
	 * @param {object} res - response
	 * @returns {object}
	 */
	async refresh(req, res) {
		try {
			let refreshToken = req.cookies.refreshToken || req.body.refreshToken;
			const decoded = await jwt.verify(refreshToken, SECRET_REFRESH);
			if (decoded) {
				const userInfo = {
					_id: decoded._id,
					name: decoded.name,
					lastname: decoded.lastname,
				};
				let refresh = this.createRefreshToken(userInfo);
				res.cookie('refreshToken', refresh, COOKIE_CONFIG);
				return res.code(200).send(this.createAsseccToken(userInfo, refresh));
			}
		} catch (err) {
			res.clearCookie('refreshToken');
			return res.code(500).send({
				status: 'FAILURE',
				message: 'Server error.',
				ss: refreshToken,
				err: err,
			});
		}
	}
	/**
	 * logout
	 * @param {object} req - request
	 * @param {object} res - response
	 * @returns {object}
	 */
	async logout(req, res) {
		try {
			const accessToken = req.body.accessToken;
			await jwt.verify(accessToken, SECRET);
			res.clearCookie('refreshToken');
			return res.code(200).send({
				status: 'SUCCESSFUL',
				message: 'User logged out.',
			});
		} catch {
			return res.code(401).send({
				status: 'FAILURE',
				message: 'The token is not valid.',
			});
		}
	}
}

module.exports = auth;
