import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  paranoid: true
});

// Add associations in your models/index.js initialization
ChatMessage.associate = function(models) {
  ChatMessage.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender'
  });
  ChatMessage.belongsTo(models.User, {
    foreignKey: 'receiverId',
    as: 'receiver'
  });
};

export { ChatMessage };