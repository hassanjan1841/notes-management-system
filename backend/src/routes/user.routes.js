import express from 'express';
import {
    getMyProfile,
    updateMyProfile,
    changeMyPassword
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

router.use(protect);

router.get('/me', getMyProfile);

router.put('/me/update',
    [
        body('name').optional().isString().trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
        body('email').optional().isEmail().withMessage('Provide a valid email').normalizeEmail()
    ],
    updateMyProfile
);

router.put('/me/change-password',
    [
        body('oldPassword', 'Old password is required').notEmpty(),
        body('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
    ],
    changeMyPassword
);

export default router; 