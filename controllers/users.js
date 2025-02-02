const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

const { JWT_SECRET } = require("../utils/config");
const {
  DEFAULT,
  NOT_FOUND,
  BAD_REQUEST,
  UNAUTHORISED,
  CONFLICT_ERROR,
} = require("../utils/errors");

const mongoDuplicateError = 11000;

const getCurrentUser = (req, res) => {
  const userId = req.user._id;

  User.findById(userId)
    .orFail(() => {
      const error = new Error("User ID not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "User ID not found") {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Invalid input, please try again" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

const createUser = (req, res) => {
  const { name, email, avatar, password } = req.body;

  if (!email) {
    return res.status(BAD_REQUEST).send({ message: "Email required" });
  }

  return User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(CONFLICT_ERROR)
          .send({ message: "A user with this email already exists" });
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
        return res
          .status(CONFLICT_ERROR)
          .send({ message: "A user with this email already exists" });
      }
      if (err.name === "ValidationError") {
        return res
          .status(BAD_REQUEST)
          .send({ message: "Invalid input, please try again" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
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
        return next(res.status(NOT_FOUND).send({ message: "User not found" }));
      }
      if (err.name === "ValidationError") {
        return next(
          res
            .status(BAD_REQUEST)
            .send({ message: "Invalid input, please try again" })
        );
      }
      return next(
        res
          .status(DEFAULT)
          .send({ message: "An error has occurred on the server" })
      );
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and password required" });
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
        return res
          .status(UNAUTHORISED)
          .send({ message: "Incorrect email or password" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = { getCurrentUser, createUser, updateProfile, login };