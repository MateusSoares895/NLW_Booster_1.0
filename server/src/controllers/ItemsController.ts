import { Request, Response } from 'express'
import ip from 'ip'
import knex from '../database/connection'

class ItemController {
  public static async index(req: Request, res: Response) {
    const items = await knex('items').select('*')

    const serializedItems = items.map(item => ({
      id: item.id,
      image_url: `http://${ip.address()}:3333/uploads/${item.image}`,
      title: item.title,
    }))

    res.json({ data: serializedItems })
  }
}

export default ItemController
