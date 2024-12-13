const mongoose = require("mongoose");
const Item = require("../models/clothingItem");
const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} = require("../utils/errors");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


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

const getItems = (req, res) => {
  Item.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error has occurred on the server." });
    });
};

const updateItem = (req, res) => {
  const {itemId} = req.param;
  const{imageURL} = req.body;

  ClothingItem.findByIdAndUpdate(itemId, {$set: {imageURL}}).orFail().then((item) => res.status(200).send({data:item}))
  .catch((e) => {
    res.status(500).send({message:"Error from updateItem", e})})
}

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  if (!isValidObjectId(itemId)) {
    return res.status(BAD_REQUEST).send({ message: "Invalid item ID." });
  }

  return Item.findByIdAndDelete(itemId)
    .orFail(() => {
      const error = new Error("Item not found.");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then(() => res.status(200).send({ message: "Item deleted successfully." }))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid item ID." });
      }
      if (err.statusCode === NOT_FOUND) {
        return res.status(NOT_FOUND).send({ message: "Item not found." });
      }
      return res
        .status(INTERNAL_SERVER_ERROR)
        .send({ message: "An error occured on the server" });
    });
};


module.exports = {
  createItem,
  getItems,
  updateItem,
  deleteItem,
}