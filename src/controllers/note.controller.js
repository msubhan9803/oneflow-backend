const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const messages = require('../utils/message');
const { noteService } = require('../services');

const getAllNotesByJobsiteId = catchAsync(async (req, res) => {
  try {
    const notes = await noteService.getAllNotesByJobsiteId(req.params.jobsiteId);
    if (!notes) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(notes);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const createNote = catchAsync(async (req, res) => {
  try {
    const note = await noteService.createNote(req.body, req.user._id);
    res.status(httpStatus.CREATED).send(note);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getNoteById = catchAsync(async (req, res) => {
  try {
    const note = await noteService.getNoteById(req.params.noteId);
    if (!note) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(note);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const updateNote = catchAsync(async (req, res) => {
  try {
    const note = await noteService.updateNote(req.body);
    res.status(httpStatus.OK).send(note);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const deleteNote = catchAsync(async (req, res) => {
  try {
    await noteService.deleteNote(req.params.noteId);
    res.status(httpStatus.OK).send({ message: messages.ResourceDeletedSuccessfully });
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

module.exports = {
  getNoteById,
  getAllNotesByJobsiteId,
  createNote,
  updateNote,
  deleteNote,
};
