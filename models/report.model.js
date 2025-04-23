import { DataTypes } from 'sequelize';
import  sequelize  from '../utils/db.js';

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reportedId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },    
  type: {
    type: DataTypes.ENUM('user', 'service'),
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true,
});

// Add associations in your model definition
Report.associate = function(models) {
    Report.belongsTo(models.User, {
      foreignKey: 'reporterId',
      as: 'reporter'
    });
    Report.belongsTo(models.User, {
      foreignKey: 'reportedId',
      as: 'reported'
    });
  };

export { Report };