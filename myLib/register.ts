import { Request, Response } from 'express'
import db from './db'
import { myRes } from './myRes'
import { ResultSetHeader } from 'mysql2'

export async function Register(req: Request, res: Response) {
    const { email, password } = req.body

    if (!email) {
        return res.status(400).json(
            myRes(0, 'ກະລຸນາໃສ່ Email')
        )
    }
    else if (!password) {
        return res.status(400).json(
            myRes(0, 'ກະລຸນາໃສ່ລະຫັດຜ່ານ')
        )
    }

    try {
        const [emailCheckResult] = await db.execute<ResultSetHeader[]>("SELECT email FROM account WHERE email = ?", [email])
        
        if (emailCheckResult.length > 0) {
            return res.status(400).json(
                myRes(0, 'Email ນີ້, ມີໃນລະບົບແລ້ວ')
            )
        }

        const [insertResult] = await db.execute<ResultSetHeader>("INSERT INTO account (email, password) VALUES (?, ?)", [email, password])

        if (insertResult.affectedRows === 1) {
            return res.status(201).json(
                myRes(1, 'ສະໝັກສະມາຊິກສຳເລັດ')
            )
        } else {
            return res.status(500).json(
                myRes(0, 'ລະບົບ Login ມີບັນຫາບາງຢ່າງ ໃນການສະມັກຜູ້ໃຊ້ງານ')
            )
        }

    } catch (error) {
        console.error('/auth/register =', error)
        return res.status(500).json(
            myRes(0, 'ລະບົບ Login ມີບັນຫາບາງຢ່າງ')
        )
    }
}