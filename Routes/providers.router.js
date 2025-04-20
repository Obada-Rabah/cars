import express from 'express'
import { asyncHandler } from '../utils/helpers.js'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import authRouter from './auth.router.js'
import { User } from '../models/index.js'
import * as providerController from '../controllers/providers.controller.js'

const providerRouter = express.Router()

providerRouter.get('/providers', authenticateUser, asyncHandler(providerController.getProviders))

providerRouter.post('/service', authenticateUser, asyncHandler(providerController.addService))

providerRouter.get('/mine', authenticateUser, asyncHandler(providerController.GetMyServices))


export default providerRouter