import prisma from '../config/db.js';
import { validationResult } from 'express-validator';

// Helper function to get the next version number for a note
async function getNextVersion(noteId) {
    const lastVersion = await prisma.noteVersion.findFirst({
        where: { noteId },
        orderBy: { version: 'desc' },
    });
    return lastVersion ? lastVersion.version + 1 : 1;
}

// Create a new note
export const createNote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, password: notePassword } = req.body;
        const userId = req.user.id; // Attached by protect middleware

        const note = await prisma.note.create({
            data: {
                title,
                description,
                password: notePassword, // This can be null
                userId,
                versions: {
                    create: [
                        {
                            title,
                            description,
                            version: 1, // Initial version
                        },
                    ],
                },
            },
            include: {
                versions: true,
                user: { select: { id: true, name: true, email: true } }
            },
        });

        const io = req.app.get('socketio');
        io.emit('note_created', { note });

        res.status(201).json(note);
    } catch (error) {
        console.error('Create Note Error:', error);
        res.status(500).json({ message: 'Server error while creating note' });
    }
};

// Get all notes (accessible to all users)
export const getAllNotes = async (req, res) => {
    try {
        const notes = await prisma.note.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                description: true,
                password: true,
                userId: true,
                user: { select: { id: true, name: true, email: true } },
                createdAt: true,
                updatedAt: true,
                _count: { select: { versions: true } }
            }
        });

        // For password-protected notes, only show title and a placeholder for description
        const notesWithConditionalDescription = notes.map(note => {
            if (note.password) {
                return { ...note, description: 'This note is password protected. Provide password to view.' };
            }
            return note;
        });

        res.status(200).json(notesWithConditionalDescription);
    } catch (error) {
        console.error('Get All Notes Error:', error);
        res.status(500).json({ message: 'Server error while fetching notes' });
    }
};

export const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const { password: providedPassword } = req.body;

        const note = await prisma.note.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                versions: { orderBy: { version: 'desc' } },
            },
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // If note is password protected and no password provided or incorrect password
        if (note.password) {
            if (!providedPassword) {
                return res.status(200).json({
                    id: note.id,
                    title: note.title,
                    isProtected: true,
                    userId: note.userId,
                    user: note.user,
                    createdAt: note.createdAt,
                    updatedAt: note.updatedAt,
                    message: 'Note is password protected. Provide password to view full content and history.'
                });
            }

            if (providedPassword !== note.password) {
                return res.status(401).json({
                    id: note.id,
                    title: note.title,
                    isProtected: true,
                    userId: note.userId,
                    user: note.user,
                    createdAt: note.createdAt,
                    updatedAt: note.updatedAt,
                    message: 'Incorrect password for note.'
                });
            }
        }

        res.status(200).json(note);
    } catch (error) {
        console.error('Get Note By ID Error:', error);
        res.status(500).json({ message: 'Server error while fetching note' });
    }
};


export const updateNote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const { title, description, password: newNotePassword } = req.body;
        const userId = req.user.id;

        const note = await prisma.note.findUnique({ where: { id } });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ message: 'User not authorized to update this note' });
        }


        const nextVersionNumber = await getNextVersion(id);

        const updatedNote = await prisma.note.update({
            where: { id },
            data: {
                title: title || note.title, // Use new title or keep old if not provided
                description: description || note.description,
                password: newNotePassword === undefined ? note.password : newNotePassword, // Allow setting, changing, or removing password
                versions: {
                    create: {
                        title: title || note.title,
                        description: description || note.description,
                        version: nextVersionNumber,
                    },
                },
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                versions: { orderBy: { version: 'desc' } }
            },
        });

        const io = req.app.get('socketio');
        io.emit('note_updated', { note: updatedNote });

        res.status(200).json(updatedNote);
    } catch (error) {
        console.error('Update Note Error:', error);
        res.status(500).json({ message: 'Server error while updating note' });
    }
};

// Delete a note (only by owner)
export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const note = await prisma.note.findUnique({ where: { id } });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.userId !== userId) {
            return res.status(403).json({ message: 'User not authorized to delete this note' });
        }

        // Prisma will cascade delete related NoteVersions due to the schema definition
        const deletedNoteId = note.id; // Store id before deleting
        const deletedNoteOwnerId = note.userId;

        await prisma.note.delete({ where: { id } });

        const io = req.app.get('socketio');
        // Send the ID of the deleted note and its owner for client-side filtering
        io.emit('note_deleted', { noteId: deletedNoteId, userId: deletedNoteOwnerId });

        res.status(200).json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete Note Error:', error);
        res.status(500).json({ message: 'Server error while deleting note' });
    }
};

// Get version history for a note
export const getNoteVersionHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const note = await prisma.note.findUnique({
            where: { id },
            select: { password: true } // Just need to check if it's password protected
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Optional: If note is password protected, you might require password to view history
        // const { password: providedPassword } = req.body;
        // if (note.password && providedPassword !== note.password) {
        //     return res.status(401).json({ message: 'Incorrect password for note. Cannot retrieve version history.' });
        // }

        const versions = await prisma.noteVersion.findMany({
            where: { noteId: id },
            orderBy: { version: 'desc' },
        });

        res.status(200).json(versions);
    } catch (error) {
        console.error('Get Note Version History Error:', error);
        res.status(500).json({ message: 'Server error while fetching version history' });
    }
};

// Revert a note to a previous version
export const revertNoteToVersion = async (req, res) => {
    try {
        const { noteId, versionId } = req.params;
        const userId = req.user.id;

        const note = await prisma.note.findUnique({ where: { id: noteId } });
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        if (note.userId !== userId) {
            return res.status(403).json({ message: 'User not authorized to revert this note' });
        }

        const versionToRevertTo = await prisma.noteVersion.findUnique({ where: { id: versionId } });
        if (!versionToRevertTo || versionToRevertTo.noteId !== noteId) {
            return res.status(404).json({ message: 'Version not found for this note' });
        }

        // Create a new version based on the one we are reverting to
        const nextVersionNumber = await getNextVersion(noteId);

        const revertedNote = await prisma.note.update({
            where: { id: noteId },
            data: {
                title: versionToRevertTo.title,
                description: versionToRevertTo.description,
                // Password of the note remains unchanged during revert for simplicity,
                // unless explicitly managed as part of versioning.
                versions: {
                    create: {
                        title: versionToRevertTo.title,
                        description: versionToRevertTo.description,
                        version: nextVersionNumber, // This is a new version, created from an old state
                    },
                },
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                versions: { orderBy: { version: 'desc' } }
            },
        });

        const io = req.app.get('socketio');
        io.emit('note_updated', { note: revertedNote }); // A revert is also an update

        res.status(200).json({ message: 'Note reverted successfully', note: revertedNote });
    } catch (error) {
        console.error('Revert Note Error:', error);
        res.status(500).json({ message: 'Server error while reverting note' });
    }
}; 