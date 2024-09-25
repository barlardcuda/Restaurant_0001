import db from "./db"
import { Request, Response } from "express"
import { RowDataPacket } from "mysql2"
import { myRes } from "./myRes"

export async function getPost(req: Request, res: Response) {
    try {
        const [result] = await db.query<RowDataPacket[]>("SELECT * FROM post ORDER BY id DESC")
        if (result.length === 0) {
            return res.status(404).json(
                myRes(0, "ບໍ່ມີສິນຄ້າ")
            )
        }

        return res.status(200).json(
            {
                result
            }
        )
    } catch (error) {
        console.error("/getPost/\n", error)
        return res.status(500).json(
            myRes(0, "ເຊີບເວີມີບັນຫາບາງຢ່າງ")
        )
    }
}