import multer from 'multer'
import { resolve } from 'path'
import { randomBytes } from 'crypto'

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'images'),
    filename(req, file, callback) {
      const hash = randomBytes(6).toString('hex')
      const fileName = `${hash}-${file.originalname}`

      callback(null, fileName)
    },
  }),
}
