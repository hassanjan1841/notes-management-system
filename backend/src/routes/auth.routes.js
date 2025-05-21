import express from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';
import { body } from 'express-validator';

const router = express.Router();

router.post('/register',
    [
        body('name', 'Name is required and must be at least 3 characters').isString().trim().isLength({ min: 3 }),
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
    ],
    register
);

router.post('/login',
    [
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password is required').exists()
    ],
    login
);

router.post('/logout', logout);

export default router; 