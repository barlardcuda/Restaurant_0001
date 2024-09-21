import { Request, Response } from 'express'
import db from './db'
import { myRes } from './myRes'
import { RowDataPacket } from 'mysql2'

export async function Login(req: Request, res: Response) {
    const { email, password } = req.body

    if (!email) {
        return res.status(400).json(
            myRes(0, 'ກະລຸນາໃສ່ Email')
        )
    } else if (!password) {
        return res.status(400).json(
            myRes(0, 'ກະລຸນາໃສ່ລະຫັດຜ່ານ')
        )
    }

    try {
        const [result] = await db.execute<RowDataPacket[]>("SELECT password FROM account WHERE email = ?", [email])
        
        if (result.length === 0) {
            return res.status(401).json(
                myRes(0, 'ອີເມວບໍ່ຖືກຕ້ອງ')
            )
        }

        const user = result[0]
        if (password !== user.password) {
            return res.status(401).json(
                myRes(0, 'ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ')
            )
        }

        req.session.account = email

        if (req.session.account) {
            return res.status(200).json(
                myRes(1, 'ເຂົ້າສູ່ລະບົບສຳເລັດ')
            )
        } else {
            return res.status(500).json(
                myRes(0, 'ລະບົບ Login ມີບັນຫາບາງຢ່າງ')
            )
        }

    } catch (error) {
        console.error('/auth/login =', error)
        return res.status(500).json(
            myRes(0, 'ລະບົບ Login ມີບັນຫາບາງຢ່າງ')
        )
    }
}
