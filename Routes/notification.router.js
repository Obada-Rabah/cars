import express from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import * as notificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.post(
  '/send',
  authenticateUser,
  asyncHandler(notificationController.sendNotification)
);

export default router;