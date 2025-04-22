import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const DeletedOrder = sequelize.define('DeletedOrder', {
    originalOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    providerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    providerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    serviceName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    CarModel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    orderCreatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    deletedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true
    },
    originalStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined', 'completed'),
        allowNull: false
    }
}, { 
    timestamps: false // We manage dates manually
});

export { DeletedOrder };