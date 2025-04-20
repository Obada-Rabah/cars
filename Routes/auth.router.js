import express from 'express'
import { User } from '../models/index.js'
import * as authController from '../controllers/auth.controller.js'
import { asyncHandler } from '../utils/helpers.js'
import { authenticateUser } from '../middlewares/auth.middleware.js'


const authRouter = express.Router()

authRouter.get('/users', authenticateUser, async (req,res) => {
    const users = await User.findAll();
    res.json(users)
})

authRouter.post('/login', asyncHandler(authController.login) )
    
authRouter.post('/register', asyncHandler(authController.register) )

authRouter.get('/me', authenticateUser ,asyncHandler(authController.getCurrentUser) )

authRouter.get('/user/:id', authenticateUser, asyncHandler(authController.getUser))

export default authRouter;