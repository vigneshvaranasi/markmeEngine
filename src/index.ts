import express from 'express'
import { configDotenv } from 'dotenv'
configDotenv()
import cors from 'cors'

import ENV from './configs/default'
import connectDB from './configs/db'
import AuthRouter from './routes/v1/authRoute';
import UserRouter from './routes/v1/userRoute';
import SpaceRouter from './routes/v1/spaceRoute'
import EventRoute from './routes/v1/eventRoute'
const app = express()
app.use(express.json())

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

connectDB().then(() => {
  app.get('/', (req, res) => {
    res.send('Markme Engine')
  });

  app.use('/v1/auth', AuthRouter);
  app.use('/v1/user', UserRouter);
  app.use('/v1/space', SpaceRouter);
  app.use('/v1/event', EventRoute)

  app.listen(ENV.PORT, () => {
    console.log('Server is Running on http://localhost:' + ENV.PORT)
  })
})