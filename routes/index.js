const express = require("express");
const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { login, createUser } = require("../controllers/users");
const { NOT_FOUND } = require("../utils/errors");

const router = express.Router();

router.use("/users", userRouter);
router.use("/items", itemRouter);

router.post("/signup", createUser);
router.post("/signin", login);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: 'Router not found' });
});

module.exports = router;