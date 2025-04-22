import { User } from "./user.model.js";
import { Car } from "./cars.model.js";
import { Service } from "./service.model.js"
import { Order } from './orders.model.js';

const models = {
    User,
    Car,
    Service,
    Order
}


// After importing all models
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

export {User, Car, Service, Order};