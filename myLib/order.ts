import { Request, Response } from 'express'
import db from './db'
import { myRes } from './myRes'
import { RowDataPacket } from 'mysql2'

export async function Order(req: Request, res: Response) {
    const cart = req.body
    const user = req.session.account

    try {
        await db.execute('INSERT INTO orderHis (user, data) VALUES (?, ?)', [user, JSON.stringify(cart)]);
        res.status(200).json(
            myRes(1, "ການຊື້ສຳເລັດ")
        )
    } catch (error) {
        res.status(500).json(
            myRes(0, "ການຊືເກີດຂໍ້ຜິດພາດ")
        )
    }
}
