import { sendPushNotification } from '../services/firebase.service.js';

export const sendNotification = async (req, res) => {
  try {
    const { token, title, body, data } = req.body;
    
    const result = await sendPushNotification(token, title, body, data);
    
    return res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};