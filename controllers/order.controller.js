import { Car, Order, Service, User } from '../models/index.js';

export async function addServiceOrder (req, res){
    try {
        
        const ProductId = req.params.id;
        const service = await Service.findByPk(ProductId);
        const SellerId = service.providerId;
        const Type = 'service';
        const CarModel = req.body.CarModel;

        const newOrder = await Order.create({
            SellerId,
            ProductId,
            CustomerId: req.user.id,
            Type,   
            CarModel
        });

        const user = await User.findByPk(SellerId);
        const Provider = user.firstName;
        const ServiceName = service.name

        res.status(201).json({
            success: true,
            data: {Provider, ServiceName ,CarModel }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export async function addCarOrder (req, res){
    try {
        
        const ProductId = req.params.id;
        const car = await Car.findByPk(ProductId);
        const SellerId = car.userId;
        const Type = 'car';
        const CarModel = car.model;

        const newOrder = await Order.create({
            SellerId,
            ProductId,
            CustomerId: req.user.id,
            Type,   
            CarModel
        });

        const user = await User.findByPk(SellerId);
        const userName = user.name;

        res.status(201).json({
            success: true,
            data: {userName ,CarModel ,Type}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export async function GetMyOrders (req, res){
    try {
        const  CustomerId  = req.user.id;
        
        const orders = await Order.findAll({
            where: { CustomerId }
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