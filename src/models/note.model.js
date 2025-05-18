const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const { Schema } = mongoose;

const noteSchema = mongoose.Schema(
  {
    noteText: {
      type: String,
      required: true,
    },
    jobsiteId: {
      type: Schema.Types.ObjectId,
      ref: 'Jobsite',
    },
    createdByUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
noteSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
