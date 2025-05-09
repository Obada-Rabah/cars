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
        attributes: { exclude: ['updatedAt']}
    });

    if(car){
        res.json(car)
    }else{
        res.status(404).json({ message: 'car not found' })
    }
}

export async function softDeleteCar(req, res) {
    const carId = parseInt(req.params.id, 10);
    if (isNaN(carId)) {
        return res.status(400).json({ message: 'Invalid car ID' });
    }

    try {
        const car = await Car.findOne({ where: { id: carId, Deleted: false } });

        if (!car) {
            return res.status(404).json({ message: 'Car not found or already deleted' });
        }

        // Update the 'deleted' column to true (soft delete)
        car.Deleted = true;
        await car.save();

        res.json({ message: 'Car has been soft deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting the car' });
    }
}