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
        const orders = await Order.findAll({
            where: { CustomerId: req.user.id },
            include: [
                {
                    model: User,
                    as: 'Provider',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Service,
                    attributes: ['id', 'name', 'price']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ orders });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching orders',
            error: error.message 
        });
    }
}



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