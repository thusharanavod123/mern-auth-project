import express from 'express';
import { register } from '../controllers/authController.js';


const auth = express.Router();
 authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/logout', logout);













