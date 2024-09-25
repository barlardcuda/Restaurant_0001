import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import db from './db';
import { myRes } from './myRes';
import { RowDataPacket } from 'mysql2';

// Multer storage and file filtering
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if (extname && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, and .jpeg formats are allowed'));
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter 
});

// API to update the post
export async function UpdatePost(req: Request, res: Response) {
    if (!req.session.admin) {
        return res.redirect('/')
    }
  upload.single('file')(req, res, async (err: any) => {
    if (err) {
      return res.json(myRes(0, err.message));
    }

    const postId = req.params.id;
    if (!postId) {
      return res.json(myRes(0, 'Post ID is required'));
    }

    const Pname = req.body.name;
    const Pprice = req.body.price;
    const file = req.file;
    let resizedFileName: string | null = null;

    try {
      if (file) {
        const filePath = file.path;
        const fileName = file.filename;

        const image = sharp(filePath);
        const metadata = await image.metadata();

        resizedFileName = fileName;

        if (metadata.width && metadata.width > 480) {
          const resizedFilePath = `public/img/img-${fileName}`;
          await image.resize({ width: 480 }).toFile(resizedFilePath);
          resizedFileName = `img-${fileName}`;

          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting original file: ${filePath}`);
          });
        }
      }

      const [rows] = await db.query<RowDataPacket[]>('SELECT imgName, name, price FROM post WHERE id = ?', [postId]);

      if (rows.length === 0) {
        return res.json(myRes(0, 'Post not found'));
      }

      const post = rows[0];

      const updatedName = Pname || post.name;
      const updatedPrice = Pprice || post.price;
      const updatedImgName = resizedFileName || post.imgName;

      const query = 'UPDATE post SET name = ?, price = ?, imgName = ? WHERE id = ?';
      await db.execute(query, [updatedName, updatedPrice, updatedImgName, postId]);

      return res.json(myRes(1, 'Post updated successfully'));
    } catch (dbError) {
      console.error(dbError);
      return res.json(myRes(0, 'Failed to update post'));
    }
  });
}
