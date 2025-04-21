import { Order, Service, User } from '../models/index.js';

// Add new order (now includes D&T)
exports.addOrder = async (req, res) => {
    try {
        const { customerId, providerId, serviceId, startedAt, commercialType, contractCard } = req.body;
        
        const newOrder = await Order.create({
            customerId,
            providerId,
            serviceId,
            startedAt: new Date(startedAt), // Date & Time from request
            commercialType,
            contractCard,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: newOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get customer's orders (updated with relationships)
exports.getMyOrders = async (req, res) => {
    try {
        const { customerId } = req.params;
        
        const orders = await Order.findAll({
            where: { customerId },
            include: [
                { model: Service },
                { model: User, as: 'provider' }
            ]
        });

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get provider's orders (updated with relationships)
exports.getProviderOrders = async (req, res) => {
    try {
        const { providerId } = req.params;
        
        const orders = await Order.findAll({
            where: { providerId },
            include: [
                { model: Service },
                { model: User, as: 'customer' }
            ]
        });

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Accept order (now with D&T handling)
exports.acceptOrder = async (req, res) => {
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

// Other controller methods remain similar but would include relationship handling