import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Order = sequelize.define('Order', {
    providerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    CustomerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ServiceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    CarModel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Date:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined', 'completed'),
        defaultValue: 'pending'
    }
}, { timestamps: true });

Order.associate = (models) => {
    Order.belongsTo(models.User, { 
        as: 'Provider',
        foreignKey: 'providerId' 
    });
    Order.belongsTo(models.User, { 
        as: 'Customer',
        foreignKey: 'CustomerId' 
    });
    Order.belongsToMany(models.Service, {
        through: 'OrderService',
        foreignKey: 'OrderId'
    });
};

export {Order};