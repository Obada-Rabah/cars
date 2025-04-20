import bcrypt from 'bcryptjs';
import { User, Car } from '../models/index.js'
import { generateToken } from '../utils/helpers.js';

export async function register(req,res) {
    const user = await User.findOne({where: { phoneNumber: req.body.phoneNumber}});

    if(user) {
        res.status(400).json({ message: 'User is already exists'})
        return;
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const newUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        password: hashedPassword,
    })

    const token = generateToken(newUser.id);

    res.status(201).json({
        token,
        user:{
            id: newUser.id,
            firstName: newUser.firstName,
        }
    })
}



export async function login(req,res){
    const user = await User.findOne({where: { phoneNumber: req.body.phoneNumber}});

    if(!user) {
        return res.status(404).json({ message: 'Phone number or password are wrong'})
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password)

    if(!isPasswordValid) {
        return res.status(404).json({ message: 'Phone number or password are wrong'})
    }

    const token = generateToken(user.id)
    res.json({token})
}


export async function getCurrentUser(req,res){
    const user = await User.findByPk(req.user.id)

    if(!user){
        return res.status(404).json({ message: 'User not found'})
    }

    res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isprovider: user.isprovider,
        location: user.location,
        image: user.image
    })
}


export async function getUser(req,res){

    const userId = req.params.id

    const user = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ['id', 'password', 'updatedAt']},
        include: [{
            model: Car,
            as: 'cars', 
            attributes: ['model', 'year', 'price'] 
        }]
    })
    
    if(user){
        res.json(user)
    }else{
        res.status(404).json(user)
    }
}