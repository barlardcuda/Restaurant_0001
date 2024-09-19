import express, { Request, Response } from 'express'
import session from 'express-session'
import cors from 'cors'
import dotenv from 'dotenv'
import { Register, Login, getPost } from './libary'

dotenv.config()

declare module 'express-session' {
    interface SessionData {
        account?: string
    }
}

const app = express()
const port = process.env.PORT || 3050

app.use(session({
    secret: process.env.SESSION_SECRET || '1001',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}))

app.get('/', (req: Request, res: Response) => {
    res.send(req.session.account)
})

app.get('/api/getPost/:count', getPost)

app.post('/auth/login', Login)

app.post('/auth/register', Register)

app.listen(port, () => {
    console.log(`Server is started on port ${port}!`)
})