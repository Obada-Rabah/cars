import express from 'express'
import { asyncHandler } from '../utils/helpers.js'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import authRouter from './auth.router.js'
import { User } from '../models/index.js'
import * as providerController from '../controllers/providers.controller.js'
import { providerOnly } from '../middlewares/providerAuth.js'

const providerRouter = express.Router()

providerRouter.get('/providers', authenticateUser, asyncHandler(providerController.getProviders))

providerRouter.post('/add', authenticateUser, providerOnly , asyncHandler(providerController.addService))

providerRouter.get('/mine', authenticateUser, providerOnly , asyncHandler(providerController.GetMyServices))

providerRouter.get('/service/:id', authenticateUser, asyncHandler(providerController.getServiceById))

providerRouter.put('/service/:id', authenticateUser, providerOnly, asyncHandler(providerController.updateService))

export default providerRouter