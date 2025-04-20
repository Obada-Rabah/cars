import express from 'express'
import { Car } from '../models/index.js'
import { asyncHandler } from '../utils/helpers.js'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import * as carsController from '../controllers/cars.controller.js'
const carsRouter = express.Router()

carsRouter.get('/cars', asyncHandler(carsController.getCars) )

carsRouter.get('/car/:id', asyncHandler(carsController.getCarById))

carsRouter.post('/add', authenticateUser ,asyncHandler(carsController.addCar))


export default carsRouter