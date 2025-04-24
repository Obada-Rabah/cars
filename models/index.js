import { User } from "./user.model.js";
import { Car } from "./cars.model.js";
import { Service } from "./service.model.js"
import { Order } from './orders.model.js';
import { DeletedOrder } from './deletedOrders.model.js'
import { Report } from "./report.model.js";
import { ChatMessage } from "./chat.model.js";

const models = {
    User,
    Car,
    Service,
    Order,
    DeletedOrder,
    Report,
    ChatMessage
}


// After importing all models
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

export {User, Car, Service, Order, DeletedOrder, Report, ChatMessage};