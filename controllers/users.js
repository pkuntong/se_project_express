const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const NotFoundError = require("../utils/Errors/NotFoundError");
const BadRequestError = require("../utils/Errors/BadRequestError");
const ConflictError = require("../utils/Errors/ConflictError");
const UnauthorisedError = require("../utils/Errors/UnauthorisedError");

const mongoDuplicateError = 11000;

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => {
      const error = new Error("User ID not found");
      error.statusCode = 404;
      throw error;
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "User ID not found") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid input, please try again"));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const { name, email, avatar, password } = req.body;

  if (!email) {
    return next(new BadRequestError("Email Required"));
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return next(new ConflictError("A user with this email already exists"));
      }

      return bcrypt
        .hash(password, 10)
        .then((hash) => User.create({ name, email, password: hash, avatar }))
        .then((user) =>
          res
            .status(201)
            .send({ name: user.name, email: user.email, avatar: user.avatar })
        );
    })
    .catch((err) => {
      console.error(err);
      if (err.code === mongoDuplicateError) {
        return next(new ConflictError("A user with this email already exists"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid input, please try again"));
      }
      return next(err);
    });
};

const updateProfile = (req, res, next) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail(() => {
      const error = new Error("User ID not found");
      error.statusCode = 404;
      throw error;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      if (err.message === "User ID not found") {
        return next(new NotFoundError("User not found"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid input, please try again"));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Invalid input, please try again"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        return next(new UnauthorisedError("Incorrect email or password"));
      }
      return next(err);
    });
};

module.exports = { getCurrentUser, createUser, updateProfile, login };