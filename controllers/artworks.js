const mongoose = require("mongoose");
const Artwork = require("../models/artwork");

const BadRequestError = require("../errors/badRequestError");
const NotFoundError = require("../errors/notFoundError");
const ForbiddenError = require("../errors/forbiddenError");

const getItems = async (req, res, next) => {
  try {
    const items = await Artwork.find({ owner: req.user._id });
    return res.json(items);
  } catch (err) {
    return next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const {
      objectID,
      title,
      artistDisplayName,
      objectDate,
      primaryImageSmall,
    } = req.body;

    const owner = req.user._id;

    if (!objectID || !title || !primaryImageSmall || !owner) {
      return next(
        new BadRequestError(
          "objectID, title, primaryImageSmall and owner are required"
        )
      );
    }

    const item = await Artwork.create({
      objectID,
      title,
      artistDisplayName,
      objectDate,
      primaryImageSmall,
      owner,
    });

    return res.status(201).json(item);
  } catch (err) {
    if (err.name === "ValidationError") {
      return next(new BadRequestError("Invalid data provided"));
    }

    return next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.isValidObjectId(itemId)) {
      return next(new BadRequestError("Invalid artwork ID"));
    }

    const item = await Artwork.findById(itemId).orFail(() => {
      throw new NotFoundError("Artwork not found");
    });

    if (item.owner.toString() !== req.user._id) {
      return next(new ForbiddenError("Cannot delete another user's artwork"));
    }

    await item.deleteOne();
    return res.json({ message: "Artwork deleted", data: item });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getItems, createItem, deleteItem };
