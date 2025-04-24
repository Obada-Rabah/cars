import { ChatMessage, User } from '../models/index.js';
import { getIO } from '../utils/socket.js';
import { Op } from 'sequelize'; // Add this import


export const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    const senderId = req.user.id;

    const message = await ChatMessage.create({
      content,
      senderId,
      receiverId
    });

    // Populate sender info
    const fullMessage = await ChatMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    // Emit to receiver
    getIO().to(`user_${receiverId}`).emit('newMessage', fullMessage);

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: fullMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message'
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
      message: 'Failed to fetch messages'
    });
  }
};