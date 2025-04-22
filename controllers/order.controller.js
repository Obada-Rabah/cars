import { Car, Order, Service, User } from '../models/index.js';

export async function addOrder(req, res) {
    try {
        const { serviceId } = req.params;
        const { CarModel } = req.body;
        const customerId = req.user.id;

        // Get service with its provider
    const service = await Service.findByPk(serviceId);

    const userId = service.providerId;
    const user = await User.findByPk(userId)
    const provider = user.firstName

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Create order
    const order = await Order.create({
      providerId: userId,
      CustomerId: customerId,
      ServiceId: serviceId,
      CarModel,
      status: 'pending'
    });


    res.status(201).json({
        data:{
            "provider": provider,
            "service": service.name,
            Date,
            "price": service.price
        }
    });
    
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      message: 'Error creating order',
      error: error.message 
    });
  }
}

export async function GetMyOrders(req, res) {
    try {
        const CustomerId = req.user.id;

        // 1. First get all orders with basic info
        const orders = await Order.findAll({
            where: { CustomerId },
            raw: true // Get plain JSON objects instead of Sequelize instances
        });

        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found' });
        }

        // 2. Extract unique provider and service IDs
        const providerIds = [...new Set(orders.map(order => order.providerId))];
        const serviceIds = [...new Set(orders.map(order => order.ServiceId))];

        // 3. Get all providers and services in single queries
        const providers = await User.findAll({
            where: { id: providerIds },
            attributes: ['id', 'firstName', 'lastName'],
            raw: true
        });

        const services = await Service.findAll({
            where: { id: serviceIds },
            attributes: ['id', 'name', 'price'],
            raw: true
        });

        // 4. Create lookup objects for faster access
        const providerMap = providers.reduce((acc, provider) => {
            acc[provider.id] = provider;
            return acc;
        }, {});

        const serviceMap = services.reduce((acc, service) => {
            acc[service.id] = service;
            return acc;
        }, {});

        // 5. Enrich orders with provider/service details
        const enrichedOrders = orders.map(order => ({
            ...order,
            provider: providerMap[order.providerId],
            service: serviceMap[order.ServiceId]
        }));

        res.json({ orders: enrichedOrders });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching orders',
            error: error.message 
        });
    }
}


// Get provider's orders (updated with relationships)
export async function GetProviderOrders(req, res) {
    try {
        const providerId = req.user.id;

        // 1. Get all orders for this provider
        const orders = await Order.findAll({
            where: { providerId },
            raw: true
        });

        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found for this provider' });
        }

        // 2. Extract unique customer and service IDs
        const customerIds = [...new Set(orders.map(order => order.CustomerId))];
        const serviceIds = [...new Set(orders.map(order => order.ServiceId))];

        // 3. Get all customers and services in single queries
        const customers = await User.findAll({
            where: { id: customerIds },
            attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
            raw: true
        });

        const services = await Service.findAll({
            where: { id: serviceIds },
            attributes: ['id', 'name', 'price'],
            raw: true
        });

        // 4. Create lookup objects
        const customerMap = customers.reduce((acc, customer) => {
            acc[customer.id] = customer;
            return acc;
        }, {});

        const serviceMap = services.reduce((acc, service) => {
            acc[service.id] = service;
            return acc;
        }, {});

        // 5. Enrich orders with customer, service, and car details
        const enrichedOrders = orders.map(order => ({
            id: order.id,
            status: order.status,
            date: order.createdAt,
            carModel: order.CarModel, // Include car model
            customer: customerMap[order.CustomerId],
            service: serviceMap[order.ServiceId]
        }));

        res.json({ 
            success: true,
            orders: enrichedOrders 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching provider orders',
            error: error.message 
        });
    }
}

export async function deleteOrder(req,res){

}

// Accept order (now with D&T handling)
export async function acceptOrder(req, res){
    try {
        const { orderId } = req.params;
        const { startedAt } = req.body; // Date & Time for acceptance
        
        const order = await Order.update(
            { 
                status: 'accepted',
                startedAt: new Date(startedAt) 
            },
            { where: { id: orderId } }
        );

        res.status(200).json({
            success: true,
            message: 'Order accepted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export async function declineOrder(req,res){

}

// Other controller methods remain similar but would include relationship handling