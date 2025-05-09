import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';

const Service = sequelize.define('services', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    providerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // References the users table
            key: 'id',
        },
    },
    Deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default value set to false (not deleted)
    },
});

Service.associate = (models) => {
    Service.belongsTo(models.User, {
        as: 'Provider',
        foreignKey: 'providerId'
    });
    Service.belongsToMany(models.Order, {
        through: 'OrderService',
        foreignKey: 'ServiceId'
    });
};


export { Service };