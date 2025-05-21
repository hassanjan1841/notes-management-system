import express from 'express';
import {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote,
    getNoteVersionHistory,
    revertNoteToVersion
} from '../controllers/note.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { body, param } from 'express-validator';

const router = express.Router();

// Public route: Get all notes
router.get('/', getAllNotes);

// Public route: Get a single note by ID (password might be required in body to unlock)
// Using POST for /:id/view to allow sending password in body for protected notes safely.
// GET requests with bodies are generally discouraged, though possible.
router.post('/:id/view',
    [param('id', 'Note ID is required').isString().notEmpty().trim()],
    getNoteById
);

// --- All routes below are protected and require authentication ---
router.use(protect);

router.post('/create',
    [
        body('title', 'Title is required').isString().notEmpty().trim(),
        body('description', 'Description is required').isString().notEmpty().trim(),
        body('password').optional({ checkFalsy: true }).isString().isLength({ min: 4 }).withMessage('Password must be at least 4 characters if provided')
    ],
    createNote
);

router.put('/:id/update',
    [
        param('id', 'Note ID is required').isString().notEmpty().trim(),
        body('title').optional().isString().notEmpty().trim(),
        body('description').optional().isString().notEmpty().trim(),
        body('password').optional({ nullable: true }).custom((value) => {
            if (value === null) return true; // explicitly removing password
            if (typeof value === 'string' && value.length >= 4) return true; // setting/changing password
            if (value === undefined) return true; // password field not provided, so no change to password
            // If value is provided but not null and not a valid string password
            if (value !== null && value !== undefined) {
                throw new Error('Password must be at least 4 characters, or null to remove');
            }
            return true;
        })
    ],
    updateNote
);

router.delete('/:id/delete',
    [param('id', 'Note ID is required').isString().notEmpty().trim()],
    deleteNote
);

router.get('/:id/versions',
    [param('id', 'Note ID is required').isString().notEmpty().trim()],
    getNoteVersionHistory
);

router.post('/:noteId/versions/:versionId/revert',
    [
        param('noteId', 'Note ID is required').isString().notEmpty().trim(),
        param('versionId', 'Version ID is required').isString().notEmpty().trim()
    ],
    revertNoteToVersion
);


export default router; 