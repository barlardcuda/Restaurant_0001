import express, { Request, Response } from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import { Register, Login } from './lib'

dotenv.config()

const app = express()
const port = process.env.PORT || 3050

app.use(session({
    secret: process.env.SESSION_SECRET || '1001',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}))

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    res.send("Hello")
})

app.post('/auth/login', Login)

app.post('/auth/register', Register)

app.listen(port, () => {
    console.log(`Server is started on port ${port}!`)
})