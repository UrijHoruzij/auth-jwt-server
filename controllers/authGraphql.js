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
 * @module authGraphql
 */

/**
 * Class function authGraphql
 */
class authGraphql {
	/**
	 * Create a authGraphql
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
	 * @param {object} input - accessToken
	 * @returns {object}
	 */
	async verify(input) {
		try {
			const { accessToken } = input;
			const decoded = await jwt.verify(accessToken, SECRET);
			if (decoded) {
				return {
					status: 'SUCCESSFUL',
					message: 'The token is valid.',
				};
			}
		} catch {
			return {
				status: 'FAILURE',
				message: 'The token is not valid.',
			};
		}
	}

	/**
	 * signinSSO
	 * @param {object} input - SSOToken
	 * @param {object} res - response
	 * @returns {object}
	 */
	async signinSSO(input, res) {
		try {
			const { SSOToken } = input;
			const decoded = await jwt.verify(SSOToken, SSO_TOKEN_SECRET);
			if (decoded) {
				const userInfo = {
					_id: decoded._id,
					name: decoded.name,
					lastname: decoded.lastname,
				};
				let refresh = this.createRefreshToken(userInfo);
				res.cookie('refreshToken', refresh, COOKIE_CONFIG);
				return this.createAsseccToken(userInfo, refresh);
			}
		} catch {
			return {
				status: 'FAILURE',
				message: 'The token is not valid.',
			};
		}
	}

	/**
	 * signup
	 * @param {object} input - email, password, name, lastname
	 * @returns {object}
	 */
	async signup(input) {
		try {
			const { email, password, name, lastname } = input;
			const user = await this.database.checkExistUser(email);
			if (user) {
				return {
					status: 'FAILURE',
					message: 'The user exists.',
				};
			} else {
				bcrypt.hash(password, 10, async (err, hash) => {
					if (err) {
						return {
							status: 'FAILURE',
							message: err,
						};
					}
					const newUser = {
						email: email,
						password: hash,
						name: name,
						lastname: lastname,
					};
					let userSave = await this.database.addUser(newUser);
					if (userSave) {
						return {
							status: 'SUCCESSFUL',
							message: 'The user is created.',
						};
					} else {
						return {
							status: 'FAILURE',
							message: 'Server error.',
						};
					}
				});
			}
		} catch {
			return {
				status: 'FAILURE',
				message: 'Server error.',
			};
		}
	}

	/**
	 * signin
	 * @param {object} input - email, password
	 * @param {object} res - response
	 * @returns {object}
	 */
	async signin(input, res) {
		try {
			const { email, password } = input;
			const user = await this.database.checkExistUser(email);
			if (!user) {
				return {
					status: 'FAILURE',
					message: 'The user is not found.',
				};
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
				return this.createAsseccToken(userInfo, refresh);
			} else {
				return { status: 'FAILURE', message: 'Wrong password.' };
			}
		} catch {
			return {
				status: 'FAILURE',
				message: 'Server error.',
			};
		}
	}

	/**
	 * refresh
	 * @param {object} input - refreshToken
	 * @param {object} req - request
	 * @param {object} res - response
	 * @returns {object}
	 */
	async refresh(input, req, res) {
		try {
			const refreshToken = req.cookies.refreshToken || input.refreshToken;
			const decoded = await jwt.verify(refreshToken, SECRET_REFRESH);
			if (decoded) {
				const userInfo = {
					_id: decoded._id,
					name: decoded.name,
					lastname: decoded.lastname,
				};
				let refresh = this.createRefreshToken(userInfo);
				res.cookie('refreshToken', refresh, COOKIE_CONFIG);
				return this.createAsseccToken(userInfo, refresh);
			}
		} catch {
			res.clearCookie('refreshToken');
			return {
				status: 'FAILURE',
				message: 'Server error.',
			};
		}
	}

	/**
	 * logout
	 * @param {object} input - accessToken
	 * @param {object} res - response
	 * @returns {object}
	 */
	async logout(input, res) {
		try {
			const { accessToken } = input;
			await jwt.verify(accessToken, SECRET);
			res.clearCookie('refreshToken');
			return {
				status: 'SUCCESSFUL',
				message: 'User logged out.',
			};
		} catch {
			return {
				status: 'FAILURE',
				message: 'The token is not valid.',
			};
		}
	}
}

module.exports = authGraphql;
