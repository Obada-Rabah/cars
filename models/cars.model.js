import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';
import { Order } from './orders.model.js';

const Car = sequelize.define('cars', {
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year:{
        type: DataTypes.STRING,
        allowNull: false
    },
    used: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    describtion: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userName:{
        type: DataTypes.STRING,
        allowNull: false
    }
})

Car.associate = (models) => {
    Car.belongsTo(models.User, { foreignKey: 'userId' });
};

Car.hasMany(Order, { foreignKey: 'ProductId' });

export { Car };

