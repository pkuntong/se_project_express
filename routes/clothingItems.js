const router = require("express").Router();
const {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  dislikeItem,
  likeItem,
} = require("../controllers/clothingItems");
const auth = require("../middlewares/auth");

router.get("/", getClothingItems);
router.post("/", auth, validateCreateItem, createClothingItem);
router.delete("/:itemId", auth, validateId, deleteClothingItem);
router.delete("/:itemId/likes", auth, validateId, dislikeItem);
router.put("/:itemId/likes", auth, validateId, likeItem);

module.exports = router;