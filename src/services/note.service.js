const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Note } = require('../models');
const ApiError = require('../utils/ApiError');
const messages = require('../utils/message');

/**
 * Get note by id
 * @param {String} noteId
 * @returns {Promise<Note>}
 */
const getNoteById = async (noteId) => {
  const note = await Note.findById(noteId);
  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  return note;
};

/**
 * Get All Notes By JobsiteId
 * @returns {Promise<Array<Note>>}
 */
const getAllNotesByJobsiteId = async (jobsiteId) => {
  const notes = await Note.find({
    jobsiteId: mongoose.Types.ObjectId(jobsiteId),
  });
  return notes;
};

/**
 * Post note
 * @param {Object} noteObj
 * @param String userId
 * @returns {Promise<Note>}
 */
const createNote = async (noteObj, userId) => {
  let note = new Note(noteObj);
  note.createdByUser = userId;

  note = await note.save();
  return note;
};

/**
 * Update note
 * @param {Object} noteObj
 * @returns {Promise<Note>}
 */
const updateNote = async (noteObj) => {
  const note = await Note.findOne({
    _id: noteObj.id,
  });

  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  note.noteText = noteObj.noteText;

  await note.save();
  return note;
};

/**
 * Update note
 * @param String noteId
 * @param String userId
 * @returns {Promise<Note>}
 */
const deleteNote = async (noteId) => {
  const note = await Note.findById(noteId);

  if (!note) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  await Note.deleteOne({ _id: noteId });
};

module.exports = {
  getNoteById,
  getAllNotesByJobsiteId,
  createNote,
  updateNote,
  deleteNote,
};
