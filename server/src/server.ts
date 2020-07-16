import express from 'express'
import { errors } from 'celebrate'
import cors from 'cors'
import routes from './routes'
import { resolve } from 'path'

const app = express()

app.use(cors())

app.use(express.json())

app.use(routes)

app.use('/uploads', express.static(resolve(__dirname, '..', 'uploads')))
app.use('/images', express.static(resolve(__dirname, '..', 'images')))

app.use(errors())

app.listen(3333)
