import db from "./db";
import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import { myRes } from "./myRes";

export async function deletePost(req: Request, res: Response) {
    if (!req.session.admin) {
        return res.redirect('/')
    }
    try {
        const { id } = req.params

        const [result] = await db.query<RowDataPacket[]>("SELECT * FROM post WHERE id = ?", [id]);

        if (result.length === 0) {
            return res.status(404).json(
                myRes(0, "ບໍ່ພົບສິນຄ້າ")
            );
        }

        await db.query("DELETE FROM post WHERE id = ?", [id]);

        return res.status(200).json(
            myRes(1, "ສຳເລັດແລ້ວ")
        );
    } catch (error) {
        console.error("/deletePost/\n", error);
        return res.status(500).json(
            myRes(0, "ເຊີບເວີມີບັນຫາບາງຢ່າງ")
        )
    }
}