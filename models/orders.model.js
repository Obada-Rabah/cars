import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Order = sequelize.define('Order', {
    SellerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    CustomerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Type: {
        type: DataTypes.ENUM('car', 'service'),
        allowNull: false
    },
    ProductId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    CarModel: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'declined', 'completed'),
        defaultValue: 'pending'
    }
}, { timestamps: true });

module.exports = Order;