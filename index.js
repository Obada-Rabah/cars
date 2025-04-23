import express from 'express'
import dotenv from 'dotenv'
import authRouter from './Routes/auth.router.js'
import carsRouter from './Routes/cars.router.js'
import sequelize, { initDB } from './utils/db.js'
import { User } from './models/index.js'
import morgan from 'morgan'
import providerRouter from './Routes/providers.router.js'
import ordersRouter from './Routes/orders.router.js'
import reportRouter from './Routes/report.router.js'

dotenv.config()

initDB()

const app = express()

app.use(morgan('dev'))
app.use(express.json())

const port = process.env.PORT || 3000

app.use('/api/auth', authRouter)

app.use('/api/cars', carsRouter)

app.use('/api/providers', providerRouter)

app.use('/api/orders', ordersRouter)

app.use('/api/report', reportRouter)


app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({error: 'Something went wrong'})
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
