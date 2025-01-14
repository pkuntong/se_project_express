const mongoose = require("mongoose");
const Item = require("../models/clothingItem");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
} = require("../utils/errors");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getItems = (req, res) => {
  Item.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;

  if (!req.user || !req.user._id) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "User is not authenticated." });
  }

  const owner = req.user._id;

  return Item.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred on the server." });
    });
};

const getItem = (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid ID format." });
  }

  return Item.findById(id)
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      }
      return res.send(item);
    })
    .catch((err) => {
      console.error(`Error fetching item by ID: ${id}`, err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred on the server." });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid item ID." });
  }

  return Item.findById(itemId)

    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      }
      if (item.owner.toString() !== req.user._id) {
        return res
          .status(FORBIDDEN)
          .send({ message: "You do not have permission to delete this item." });
      }

      return Item.findByIdAndDelete(itemId).then(() =>
        res.send({ message: "Item deleted successfully." })
      );
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID." });
      }

      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occured on the server" });
    });
};

const likeItem = (req, res) => {
  const { itemId } = req.params;

  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid item ID." });
  }

  return Item.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      }
      return res.send(item);
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred on the server." });
    });
};

const dislikeItem = (req, res) => {
  const { itemId } = req.params;

  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid item ID." });
  }

  return Item.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      }
      return res.send(item);
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occurred on the server." });
    });
};

module.exports = {
  getItems,
  createItem,
  getItem,
  deleteItem,
  likeItem,
  dislikeItem,
};