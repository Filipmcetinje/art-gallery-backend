const express = require("express");

const router = express.Router();

const auth = require("../middlewares/auth");
const {
  validateCardBody,
  validateItemId,
} = require("../middlewares/validation");

const { getItems, createItem, deleteItem } = require("../controllers/artworks");

router.get("/", auth, getItems);

router.use(auth);

router.post("/", validateCardBody, createItem);

router.delete("/:itemId", validateItemId, deleteItem);

module.exports = router;
