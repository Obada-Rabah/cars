import bcrypt from 'bcryptjs';
import { User, Car } from '../models/index.js'
import { generateToken } from '../utils/helpers.js';

export async function register(req, res) {
    const user = await User.findOne({ where: { phoneNumber: req.body.phoneNumber } });

    if (user) {
        res.status(400).json({ message: 'User is already exists' })
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
        user: {
            id: newUser.id,
            firstName: newUser.firstName,
        }
    })
}



export async function login(req, res) {
    const user = await User.findOne({ where: { phoneNumber: req.body.phoneNumber } });

    if (!user) {
        return res.status(404).json({ message: 'Phone number or password are wrong' })
    }

    const isPasswordValid = await bcrypt.compare(req.body.password, user.password)

    if (!isPasswordValid) {
        return res.status(404).json({ message: 'Phone number or password are wrong' })
    }

    const token = generateToken(user.id)
    res.json({ token })
}


export async function getCurrentUser(req, res) {
    try {
        const user = await User.findOne({
            where: { id: req.user.id },
            attributes: { exclude: ['password', 'updatedAt'] },
            include: [{
                model: Car,
                as: 'cars',
                attributes: ['id', 'model', 'year', 'price'],
                required: false
            }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        res.status(500).json({ message: 'Server error' });
    }
}



export async function getUser(req, res) {

    const userId = req.params.id

    const user = await User.findOne({
        where: { id: userId },
        attributes: { exclude: ['password', 'updatedAt'] },
        include: [{
            model: Car,
            as: 'cars',
            attributes: ['model', 'year', 'price']
        }]
    })

    if (user) {
        res.json(user)
    } else {
        res.status(404).json(user)
    }
}