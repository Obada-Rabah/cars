import { DeletedOrder } from '../models/deletedOrders.model.js';
import { Car, Order, Service, User } from '../models/index.js';
import  sequelize  from '../utils/db.js'; // Add this import

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
            service: serviceMap[order.ServiceId],
            declineReason: order.declineReason
        }));

         // 6. Sort orders by status: pending first, then accepted, then declined
         enrichedOrders.sort((a, b) => {
            // Define the priority of each status
            const statusPriority = {
                'pending': 1,
                'accepted': 2,
                'declined': 3,
                'completed': 4 // if you want to include completed orders
            };
            
            return statusPriority[a.status] - statusPriority[b.status];
        });

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

export async function deleteOrder(req, res) {
    try {
        const orderId = req.params.id;
        const { reason } = req.body;
        const customerId = req.user.id;

        // 1. Find the order with associated data
        const order = await Order.findByPk(orderId, {
            include: [
                { 
                    model: User, 
                    as: 'Provider',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: User,
                    as: 'Customer',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Service,
                    as: 'Service', // Explicit alias matching your association
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // 2. Verify the requester is the customer who created the order
        if (order.CustomerId !== customerId) {
            return res.status(403).json({ 
                message: 'You can only delete your own orders' 
            });
        }

        // 3. Get service name safely
        const serviceName = order.Service 
            ? order.Service.name 
            : await Service.findByPk(order.ServiceId)
                .then(s => s?.name || 'Deleted Service')
                .catch(() => 'Unknown Service');

        // 4. Archive to DeletedOrders
        await DeletedOrder.create({
            originalOrderId: order.id,
            providerId: order.providerId,
            providerName: `${order.Provider.firstName} ${order.Provider.lastName}`,
            customerId: order.CustomerId,
            customerName: `${order.Customer.firstName} ${order.Customer.lastName}`,
            serviceId: order.ServiceId,
            serviceName: serviceName,
            CarModel: order.CarModel,
            orderCreatedAt: order.createdAt,
            originalStatus: order.status,
            reason: reason || 'No reason provided'
        });

        // 5. Delete the original order
        await order.destroy();

        res.json({ 
            success: true,
            message: 'Order deleted and archived successfully'
        });

    } catch (error) {
        console.error('Delete error details:', {
            error: error.message,
            stack: error.stack,
            params: req.params,
            body: req.body
        });
        res.status(500).json({
            success: false,
            message: 'Error deleting order',
            error: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Internal server error'
        });
    }
}

export async function acceptOrder(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const orderId = req.params.id;
        const providerId = req.user.id;

        // Verify order exists and belongs to this provider
        const order = await Order.findOne({
            where: { 
                id: orderId,
                providerId
            },
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Order not found or you are not the provider'
            });
        }

        if (order.status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Only pending orders can be accepted (current status: ${order.status})`
            });
        }

        // Update order
        await order.update({
            status: 'accepted',
            updatedAt: new Date() // Changed from acceptedAt to updatedAt to match your schema
        }, { transaction });

        await transaction.commit();

        try {
            // Get updated order with customer details (outside transaction)
            const updatedOrder = await Order.findByPk(orderId, {
                include: [
                    {
                        model: User,
                        as: 'Customer',
                        attributes: ['firstName', 'lastName', 'phoneNumber']
                    },
                    {
                        model: Service,
                        as: 'Service',
                        attributes: ['name', 'price']
                    }
                ]
            });

            return res.json({
                success: true,
                message: 'Order accepted successfully',
                order: updatedOrder
            });
        } catch (queryError) {
            console.error('Error fetching updated order:', queryError);
            return res.json({
                success: true,
                message: 'Order accepted successfully (details unavailable)'
            });
        }

    } catch (error) {
        // Only rollback if transaction is still active
        if (transaction.finished !== 'commit') {
            await transaction.rollback();
        }
        
        console.error('Accept order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to accept order',
            error: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Internal server error'
        });
    }
}

export async function declineOrder(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const orderId = req.params.id;
        const providerId = req.user.id;
        const { reason } = req.body; // Optional reason for declining

        // Verify order exists and belongs to this provider
        const order = await Order.findOne({
            where: { 
                id: orderId,
                providerId
            },
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Order not found or you are not the provider'
            });
        }

        if (order.status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: `Only pending orders can be declined (current status: ${order.status})`
            });
        }

        // Update order
        await order.update({
            status: 'declined',
            declineReason: reason || 'No reason provided',
            updatedAt: new Date()
        }, { transaction });

        await transaction.commit();

        try {
            // Get updated order with customer details (outside transaction)
            const updatedOrder = await Order.findByPk(orderId, {
                include: [
                    {
                        model: User,
                        as: 'Customer',
                        attributes: ['firstName', 'lastName', 'phoneNumber']
                    },
                    {
                        model: Service,
                        as: 'Service',
                        attributes: ['name', 'price']
                    }
                ]
            });

            return res.json({
                success: true,
                message: 'Order declined successfully',
                order: updatedOrder
            });
        } catch (queryError) {
            console.error('Error fetching updated order:', queryError);
            return res.json({
                success: true,
                message: 'Order declined successfully (details unavailable)'
            });
        }

    } catch (error) {
        // Only rollback if transaction is still active
        if (transaction.finished !== 'commit') {
            await transaction.rollback();
        }
        
        console.error('Decline order error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to decline order',
            error: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Internal server error'
        });
    }
}