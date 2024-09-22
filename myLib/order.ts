import { Request, Response } from 'express'
import db from './db'
import { myRes } from './myRes'
import { RowDataPacket } from 'mysql2'

export async function Login(req: Request, res: Response) {
    const { id, price, quantity } = req.body
}
