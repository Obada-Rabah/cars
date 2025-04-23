import express from 'express'
import { asyncHandler } from '../utils/helpers.js'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import * as reportController from '../controllers/report.controller.js'

const reportRouter = express.Router()

reportRouter.post('/add/:id', authenticateUser, asyncHandler(reportController.addReport))

export default reportRouter