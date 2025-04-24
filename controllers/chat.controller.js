import { ChatMessage, User } from '../models/index.js';
import { getIO } from '../utils/socket.js';
import { Op } from 'sequelize';
import { sendPushNotification } from '../services/firebase.service.js';

export const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    const senderId = req.user.id;

    // Get sender details for notification
    const sender = await User.findByPk(senderId, {
      attributes: ['id', 'firstName']
    });

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    // Create and save the message
    const message = await ChatMessage.create({
      content,
      senderId,
      receiverId
    });

    // Populate full message details for response
    const fullMessage = await ChatMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    // Emit real-time message via Socket.io
    getIO().to(`user_${receiverId}`).emit('newMessage', fullMessage);

    // Send push notification if receiver has FCM token
    const receiver = await User.findByPk(receiverId, {
      attributes: ['id', 'fcmToken']
    });

    if (receiver && receiver.fcmToken) {
      try {
        await sendPushNotification(
          receiver.fcmToken,
          'New Message',
          `You have a new message from ${sender.firstName}`,
          {
            type: 'NEW_MESSAGE',
            messageId: message.id.toString(),
            senderId: sender.id.toString()
          }
        );
      } catch (fcmError) {
        console.error('FCM Error:', fcmError);
        // Don't fail the whole request if FCM fails
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: fullMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await ChatMessage.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName']
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};