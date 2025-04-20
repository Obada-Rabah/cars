import { Car, User } from "../models/index.js";

export async function addCar(req, res){

    const user = await User.findByPk(req.user.id);
    const userName = `${user.firstName} ${user.lastName}`

    const newCar = await Car.create({
        model: req.body.model,
        year: req.body.year,
        used: req.body.used,
        describtion: req.body.describtion,
        price: req.body.price,
        userId: req.user.id,
        userName: userName
    })

    res.status(201).json({
        message: "The car has been aded sucessfully"
    })
}


export async function getCars(req,res){
    const cars = await Car.findAll({
        attributes: { exclude: ['updatedAt', 'userId'] }
    });
    res.json(cars)
}


export async function getCarById(req,res){
    
    const carId = parseInt(req.params.id, 10);
    if (isNaN(carId)) {
        return res.status(400).json({ message: 'Invalid car ID' });
    }

    const car = await Car.findOne({
        where: { id: carId },
        attributes: { exclude: ['updatedAt', 'userId']}
    });

    if(car){
        res.json(car)
    }else{
        res.status(404).json({ message: 'car not found' })
    }
}