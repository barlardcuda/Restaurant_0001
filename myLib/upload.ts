  import { Request, Response } from 'express'
  import multer from 'multer'
  import path from 'path'
  import sharp from 'sharp'
  import fs from 'fs'
  import db from './db'
  import { myRes } from './myRes'

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/img/')
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
  })

  const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    const fileTypes = /jpeg|jpg|png/
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimeType = fileTypes.test(file.mimetype)

    if (extname && mimeType) {
      return cb(null, true)
    } else {
      return cb(new Error('Only .png, .jpg, and .jpeg formats are allowed'))
    }
  }

  const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter 
  })

  export async function Uploads(req: Request, res: Response) {
    if (!req.session.admin) {
      return res.redirect('/')
  }
    upload.single('file')(req, res, async (err: any) => {
      if (err) {
        return res.json(
          myRes(0, err.message)
        )
      }
      if (!req.file) {
        return res.json(
          myRes(0, 'No file uploaded')
        )
      }

      const filePath = req.file.path
      const fileName = req.file.filename
      const Pname = req.body.name
      const Pprice = req.body.price

      if (!Pname || !Pprice) {
        return res.json(
          myRes(0, 'Text fields are required')
        )
      }

      try {
        const image = sharp(filePath)
        const metadata = await image.metadata()

        let resizedFileName = fileName

        if (metadata.width && metadata.width > 480) {
          const resizedFilePath = `public/img/img-${fileName}`
          await image.resize({ width: 480 }).toFile(resizedFilePath)
          resizedFileName = `img-${fileName}`

          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting original file: ${filePath}`)
          })
        }

        const query = 'INSERT INTO post (imgName, name, price) VALUES (?, ?, ?)'
        await db.execute(query, [resizedFileName, Pname, Pprice])

        return res.json(
          myRes(1, `File and texts uploaded successfully: ${resizedFileName}`)
        )
      } catch (dbError) {
        return res.json(
          myRes(0, 'Failed to save file and texts to the database')
        )
      }
    })
  }
