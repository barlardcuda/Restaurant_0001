import express, { Request, Response, NextFunction } from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import path from 'path'
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

const allowWithoutLogin = ['/login.html', '/register.html', '/tailwind.js', '/auth/login', '/auth/register']

function checkLogin(req: Request, res: Response, next: NextFunction) {
    if (req.session?.account || allowWithoutLogin.includes(req.path)) {
        return next()
    }
    res.redirect('/login.html')
}

app.use(checkLogin)

app.use(express.static(path.join(__dirname, 'public')))

app.get('/api/getPost', getPost)

app.post('/auth/login', Login)
app.post('/auth/register', Register)
app.get('/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Failed to destroy session');
        }
        res.redirect('/login')
      })
})

app.listen(port, () => {
    console.log(`Server is started on port ${port}!`)
})
