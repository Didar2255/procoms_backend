const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = {
  Laptop: mongoose.model('Laptop', productSchema),
  Camera: mongoose.model('Camera', productSchema),
  Drone: mongoose.model('Drone', productSchema),
};
