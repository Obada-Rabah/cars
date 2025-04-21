import { Order, Service, User } from '../models/index.js';

export async function addOrder (req, res){
    try {
        const { SellerId, CustomerId, Type, ProductId, CarModel } = req.body;
        
        const newOrder = await Order.create({
            SellerId,
            CustomerId,
            Type,
            ProductId,
            CarModel,
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
export async function GetMyOrders (req, res){
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
export async function GetProviderOrders(res, req) {
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