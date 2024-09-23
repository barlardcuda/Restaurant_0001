import express, { Request, Response, NextFunction } from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import path from 'path'
import { Login, Order, Uploads, getPost } from './libary'

dotenv.config()

declare module 'express-session' {
    interface SessionData {
        account?: string
        admin: string
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

const allowWithoutLogin = ['/login.html', '/register.html', '/tailwind.js', '/css/index.css','/fonts/notosanslao.ttf', '/icons/uicons-bold-rounded.css', '/auth/login']

function checkLogin(req: Request, res: Response, next: NextFunction) {
    if (req.session?.account || allowWithoutLogin.includes(req.path)) {
        return next()
    }
    return res.redirect('/login.html')
}

app.use(checkLogin)

app.use(express.static(path.join(__dirname, 'public')))

app.get('/api/getPost', getPost)

app.post('/api/order', Order)
app.post('/api/upload', Uploads)

app.post('/auth/login', Login)
app.get('/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).send('Failed to destroy session')
        }
        res.redirect('/login')
      })
})

app.listen(port, () => {
    console.log(`Server is started on port ${port}!`)
})
