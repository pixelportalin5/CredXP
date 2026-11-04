const authService = require("../services/authService");
const { getDbProvider } = require("../lib/dbProvider");
const ApiError = require("../utils/ApiError");

function otpService() {
  if (getDbProvider() !== "postgres") throw new ApiError(501, "Mobile login needs the Postgres database");
  return require("../services/otpAuthService");
}

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await authService.updateMe(req.user._id, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const user = await authService.updatePassword(req.user._id, req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const googleSignIn = async (req, res, next) => {
  try {
    if (getDbProvider() !== "postgres") throw new ApiError(501, "Google sign-in needs the Postgres database");
    const googleAuthService = require("../services/googleAuthService");
    const { credential, role } = req.body || {};
    res.json({ success: true, data: await googleAuthService.signIn(credential, { role }) });
  } catch (error) {
    next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    res.json({ success: true, data: await otpService().sendCode(req.body?.phone) });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    res.json({ success: true, data: await otpService().verifyCode(req.body?.phone, req.body?.code) });
  } catch (error) {
    next(error);
  }
};

const completeOtpSignup = async (req, res, next) => {
  try {
    const { signupToken, name, email, role } = req.body || {};
    res.status(201).json({ success: true, data: await otpService().completeSignup(signupToken, { name, email, role }) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleSignIn,
  sendOtp,
  verifyOtp,
  completeOtpSignup,
  register,
  login,
  me,
  updateMe,
  updatePassword,
};
