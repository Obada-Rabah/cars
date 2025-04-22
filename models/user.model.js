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
    // Regular user's cars (if applicable)
    User.hasMany(models.Car, { 
        foreignKey: 'userId' 
    });
    
    // --- PROVIDER-RELATED ASSOCIATIONS ---
    // A provider can offer multiple services
    User.hasMany(models.Service, { 
        as: 'ProvidedServices',
        foreignKey: 'providerId' 
    });
    
    // A provider can receive orders (as a service provider)
    User.hasMany(models.Order, { 
        as: 'ReceivedOrders', // Orders received from customers/other providers
        foreignKey: 'providerId' 
    });
    
    // --- CUSTOMER-RELATED ASSOCIATIONS (for both regular users & providers) ---
    // Any user (regular or provider) can place orders
    User.hasMany(models.Order, { 
        as: 'PlacedOrders', // Orders they placed as a customer
        foreignKey: 'CustomerId' 
    });
};

export { User };

