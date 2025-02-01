const ClothingItem = require("../models/clothingItem");
const {
  DEFAULT,
  NOT_FOUND,
  BAD_REQUEST,
  FORBIDDEN_ERROR,
} = require("../utils/errors");

// Get all clothing items
const getClothingItems = (req, res) => {
  ClothingItem.find({})
    .populate("owner")
    .then((items) => res.send({ data: items }))
    .catch((err) => {
      console.error(err);
      res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

// Create a new clothing item
const createClothingItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => item.populate("owner"))
    .then((populatedItem) => {
      res.status(201).send({ data: populatedItem });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        res
          .status(BAD_REQUEST)
          .send({ message: "Invalid input, please try again" });
      } else {
        res
          .status(DEFAULT)
          .send({ message: "An error has occurred on the server" });
      }
    });
};

// Delete a clothing item
const deleteClothingItem = (req, res) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        return res.status(FORBIDDEN_ERROR).send({
          message: "You do not have permission to delete this item",
        });
      }
      return ClothingItem.findByIdAndDelete(itemId).then(() => {
        res.send({ message: "Item successfully deleted" });
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Item ID not found") {
        return res.status(NOT_FOUND).send({ message: "Item not found" });
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

// Like a clothing item
const likeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    {
      $addToSet: { likes: req.user._id },
    },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .populate("owner")
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.message === "Clothing item not found") {
        res.status(NOT_FOUND).send({ message: "Clothing item not found" });
      } else if (err.name === "CastError") {
        res
          .status(BAD_REQUEST)
          .send({ message: "Invalid input, please try again" });
      } else {
        res
          .status(DEFAULT)
          .send({ message: "An error has occurred on the server" });
      }
    });
};

// Dislike a clothing item
const dislikeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    {
      $pull: { likes: req.user._id },
    },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Clothing item not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .populate("owner")
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.message === "Clothing item not found") {
        res.status(NOT_FOUND).send({ message: "Clothing item not found" });
      } else if (err.name === "CastError") {
        res
          .status(BAD_REQUEST)
          .send({ message: "Invalid input, please try again" });
      } else {
        res
          .status(DEFAULT)
          .send({ message: "An error has occurred on the server" });
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