import { Service, User } from "../models/index.js"

export async function getProviders (req,res){
    const providers = await User.findAll( { 
        where: {isprovider: true },
        attributes: { exclude: ['phoneNumber', 'password']}
     } )
    res.json(providers)
}


export async function addService (req,res){

    const user = await User.findByPk(req.user.id)

    
    const newService = await Service.create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        image: req.body.image,
        providerId: req.user.id
    })

    res.status(201).json({
        user:{
            provider: newService.providerId,
            service: newService.name
        }
    })
}


export async function GetMyServices(req,res){
    const user = await User.findByPk(req.user.id)

    if(!user){
        res.status(404).json({message: 'User not found'})
        return; 
    }//else if(user.isprovider === false){
    //     res.status(403).json({message: 'User is not a provider'})
    //     return;
    // }

    const services = await Service.findAll({
        where: {providerId: req.user.id} 
    })

    res.status(201).json({
        MyServices: {
            services
        }
    })
}

export async function updateService(req, res) {
    const { id } = req.params; // service ID to update
    const updates = req.body; // fields to update (name, price, description, etc.)
    
    try {
        // First find the service to ensure it exists and belongs to this provider
        const service = await Service.findOne({
            where: {
                id: id,
                providerId: req.user.id // ensure the service belongs to the requesting provider
            }
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found or you are not the owner' });
        }

        // Update the service with the new values
        await service.update(updates);

        // Return the updated service
        return res.status(200).json({
            message: 'Service updated successfully',
            service: service
        });
    } catch (error) {
        console.error('Error updating service:', error);
        return res.status(500).json({ message: 'Error updating service' });
    }
}

export async function getServiceById(req, res) {
    const { id } = req.params; // service ID to fetch
    
    try {
        const service = await Service.findOne({
            where: { id },
            include: [{
                model: User,
                as: 'Provider', // assuming you have this association set up
                attributes: ['id', 'firstName', 'lastName'] // only include these fields
            }]
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        return res.status(200).json({
            service: service
        });
    } catch (error) {
        console.error('Error fetching service:', error);
        return res.status(500).json({ message: 'Error fetching service' });
    }
}

export const softDeleteService = async (req, res) => {
    const serviceId = req.params.id;

    try {
        // Find the service by its ID
        const service = await Service.findByPk(serviceId);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Update the "Deleted" column to true to perform the soft delete
        await service.update({ Deleted: true });

        return res.status(200).json({ message: 'Service soft deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Soft delete error: ' + error.message });
    }
};