const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    short_desc: {
      type: String,
      required: true,
    },
    long_desc: {
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
    comments: Array,
    category: {
      type: String,
      required: true,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Products', productSchema);
