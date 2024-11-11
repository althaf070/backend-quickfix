import express from 'express';
import { getProviderMessages, getUserMessages, sendMessage, sendMessageFromProvider } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/verifytoken.js';
import { verifyProviderToken } from '../middleware/verifyProviderToken.js';

const router = express.Router();
// user
router.get('/get/:id',verifyToken, getUserMessages)
router.post('/send/:id',verifyToken, sendMessage)

// provider
router.get('/provider/get/:id',verifyProviderToken, getProviderMessages)
router.post('/provider/send/:id',verifyProviderToken,sendMessageFromProvider)

export default router