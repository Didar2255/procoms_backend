const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    role: String,
  },
  { versionKey: false }
);

module.exports = mongoose.model('Review', reviewSchema);
