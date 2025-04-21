import express from 'express'
import { asyncHandler } from '../utils/helpers.js'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import * as ordersController from '../controllers/order.controller.js'
const ordersRouter = express.Router()

ordersRouter.post('/add', authenticateUser, asyncHandler(ordersController.addOrder));

ordersRouter.get('/MyOrders', authenticateUser, asyncHandler(ordersController.GetMyOrders));

ordersRouter.get('provider/MyOrders', authenticateUser, asyncHandler(ordersController.GetProviderOrders))

ordersRouter.post('/delete:id', authenticateUser, asyncHandler(ordersController.deleteOrder));

ordersRouter.post('/acceptOrder:id', authenticateUser, asyncHandler(ordersController.acceptOrder))

ordersRouter.post('/declineOrder:id', authenticateUser, asyncHandler(ordersController.declineOrder))

export default ordersRouter