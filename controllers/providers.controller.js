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