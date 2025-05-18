const express = require('express');
const auth = require('../../middlewares/auth');
const noteController = require('../../controllers/note.controller');

const router = express.Router();

router.get('/getNoteById/:noteId', auth(), noteController.getNoteById);
router.get('/getAllNotesByJobsiteId/:jobsiteId', auth(), noteController.getAllNotesByJobsiteId);
router.post('/createNote', auth(), noteController.createNote);
router.put('/updateNote', auth(), noteController.updateNote);
router.delete('/deleteNote/:noteId', auth(), noteController.deleteNote);

module.exports = router;
