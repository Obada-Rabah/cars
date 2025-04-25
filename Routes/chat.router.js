import express from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import * as chatController from '../controllers/chat.controller.js';

const chatRouter = express.Router();

chatRouter.post(
    '/send',
    authenticateUser,
    asyncHandler(chatController.sendMessage)
);

chatRouter.get(
    '/:userId',
    authenticateUser,
    asyncHandler(chatController.getMessages)
);

chatRouter.get(
    '/',
    authenticateUser,
    asyncHandler(chatController.getChatList)
);

export default chatRouter;