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

router.get('/', getAllNotes);

router.post('/:id/view',
    [param('id', 'Note ID is required').isString().notEmpty().trim()],
    getNoteById
);

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
            if (value === null) return true;
            if (typeof value === 'string' && value.length >= 4) return true;
            if (value === undefined) return true;
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