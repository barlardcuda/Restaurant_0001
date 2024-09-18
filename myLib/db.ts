import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function connectToDatabase() {
    try {
        const db = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PW || '',
            database: process.env.MYSQL_DB,
        })

        console.log('Connected to MySQL database!')
        return db
    } catch (error) {
        console.error('Error connecting to MySQL database:', error)
        throw error
    }
}

const db = await connectToDatabase()

export default db
