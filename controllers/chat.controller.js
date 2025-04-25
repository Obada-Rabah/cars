import { ChatMessage, User } from '../models/index.js';
import { getIO } from '../utils/socket.js';
import { Op } from 'sequelize';
import  sequelize  from '../utils/db.js'
//import { sendPushNotification } from '../services/firebase.service.js';

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

// Add this new function to your existing controller
export const getChatList = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all unique users the current user has chatted with
    const chatPartners = await ChatMessage.findAll({
      attributes: [
        [sequelize.literal(`DISTINCT CASE 
          WHEN "senderId" = ${currentUserId} THEN "receiverId"
          ELSE "senderId"
        END`), 'partnerId']
      ],
      where: {
        [Op.or]: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      raw: true
    });

    // Get details for each conversation
    const chatList = await Promise.all(
      chatPartners.map(async ({ partnerId }) => {
        // Get partner details
        const partner = await User.findByPk(partnerId, {
          attributes: ['id', 'firstName', 'lastName', 'image']
        });

        if (!partner) return null;

        // Get the last message in this conversation
        const lastMessage = await ChatMessage.findOne({
          where: {
            [Op.or]: [
              { senderId: currentUserId, receiverId: partnerId },
              { senderId: partnerId, receiverId: currentUserId }
            ]
          },
          order: [['createdAt', 'DESC']],
          limit: 1,
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'firstName']
            }
          ]
        });

        return {
          chatId: partner.id, // This is the ID you'll use for fetching messages
          userId: partner.id, // Same as chatId (for backward compatibility)
          firstName: partner.firstName,
          lastName: partner.lastName,
          image: partner.image,
          lastMessage: lastMessage?.content,
          lastMessageTime: lastMessage?.createdAt,
          lastMessageSender: lastMessage?.sender?.id === currentUserId ? 'You' : lastMessage?.sender?.firstName,
          unreadCount: 0 // You can add this if you implement message read status
        };
      })
    );

    // Filter and sort
    const filteredChatList = chatList.filter(chat => chat !== null);
    filteredChatList.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    return res.status(200).json({
      success: true,
      data: filteredChatList
    });
  } catch (error) {
    console.error('Error fetching chat list:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch chat list',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};