const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const countySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    commercialRateList: [
      {
        type: Number,
      },
    ],
    residentialRateList: [
      {
        type: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
countySchema.plugin(toJSON);

/**
 * @typedef County
 */
const County = mongoose.model('County', countySchema);

module.exports = County;
