const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../utils/config");
const UnauthorisedError = require("../utils/Errors/UnauthorisedError");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new UnauthorisedError("Authorization required"));
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error(err);
    return next(new UnauthorisedError("Authorization required"));
  }

  req.user = payload;
  return next();
};

module.exports = auth;