const router = require("express").Router();
const userRouter = require("./users");
const clothingItems = require("./clothingItems");
const { createUser, login } = require("../controllers/users");
const NotFoundError = require("../utils/Errors/NotFoundError");
const {
  validateCreateUser,
  validateLogIn,
} = require("../middlewares/validation");

router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

router.post("/signin", validateLogIn, login);
router.post("/signup", validateCreateUser, createUser);
router.use("/users", userRouter);
router.use("/items", clothingItems);

router.use((req, res, next) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;