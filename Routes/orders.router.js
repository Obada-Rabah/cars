import express from 'express'
import { asyncHandler } from '../utils/helpers.js'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import * as ordersController from '../controllers/order.controller.js'
import { providerOnly } from '../middlewares/providerAuth.js'
const ordersRouter = express.Router()

ordersRouter.post('/add/:serviceId', authenticateUser, asyncHandler(ordersController.addOrder));

ordersRouter.get('/MyOrders', authenticateUser, asyncHandler(ordersController.GetMyOrders));

ordersRouter.get('/provider/MyOrders', authenticateUser, providerOnly , asyncHandler(ordersController.GetProviderOrders))

ordersRouter.post('/delete/:id', authenticateUser, asyncHandler(ordersController.deleteOrder));

ordersRouter.put('/accept/:id', authenticateUser, asyncHandler(ordersController.acceptOrder))

ordersRouter.put('/decline/:id', authenticateUser, asyncHandler(ordersController.declineOrder))

export default ordersRouter