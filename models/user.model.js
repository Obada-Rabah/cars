import { DataTypes } from 'sequelize';
import sequelize from '../utils/db.js';
import { Car,  } from './index.js';


const User = sequelize.define('users', {
    firstName: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isprovider: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true, // Only for providers
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true, // Only for providers
    },
})

User.associate = (models) => {
    User.hasMany(models.Car, { foreignKey: 'userId' });
};

User.associate = (models) => {
    User.hasMany(models.Service, { foreignKey: 'providerId' });
} 

export { User };

