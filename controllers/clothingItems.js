const ClothingItem = require("../models/clothingItem");
const BadRequestError = require('../utils/Errors/BadRequestError');
const ForbiddenError = require('../utils/Errors/ForbiddenError');
const NotFoundError = require('../utils/Errors/NotFoundError');


const getClothingItems = (req, res, next) => {
  ClothingItem.find({})
    .populate("owner")
    .then((items) => res.send({ data: items }))
    .catch(next);
};

const createClothingItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => item.populate("owner"))
    .then((populatedItem) => {
      res.status(201).send({ data: populatedItem });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid input, please try again"));
      } else {
        next(err);
      }
    });
};

const deleteClothingItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = 404;
      throw error;
    })
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        return next(
          new ForbiddenError("You do not have permission to delete this item")
        );
      }
      return ClothingItem.findByIdAndDelete(itemId).then(() => {
        res.send({ message: "Item successfully deleted" });
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Item ID not found") {
        return next(new NotFoundError("Item not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Invalid input, please try again"));
      }
      return next(err);
    });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    {
      $addToSet: { likes: req.user._id },
    },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = 404;
      throw error;
    })
    .populate("owner")
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.message === "Clothing item not found") {
        next(new NotFoundError("Clothing item not found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Invalid input, please try again"));
      } else {
        next(err);
      }
    });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    {
      $pull: { likes: req.user._id },
    },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = 404;
      throw error;
    })
    .populate("owner")
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.message === "Clothing item not found") {
        next(new NotFoundError("Clothing item not found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Invalid input, please try again"));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeItem,
  dislikeItem,
};