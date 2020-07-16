import { Request, Response } from 'express'
import ip from 'ip'
import knex from '../database/connection'

class PointsController {
  public static async index(req: Request, res: Response) {
    const { city, uf, items } = req.query

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()))

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('points.cidade', String(city))
      .where('points.uf', String(uf))
      .distinct()
      .select('points.*')

    const serializedPoints = points.map(point => ({
      ...point,
      image_url: `http://${ip.address()}:3333/images/${point.image}`,
    }))

    return res.json(serializedPoints)
  }
  public static async show(req: Request, res: Response) {
    const { id } = req.params

    const point = await knex('points').where('id', id).first()

    if (!point) {
      return res.status(404).json({ message: 'Point is not found!' })
    }



    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title')

    const serializedPoint = {
      ...point,
      image_url: `https://${ip.address()}:3333/images/${point.image}`
    }

    return res.json({ point, items })
  }
  public static async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      cidade,
      uf,
      items
    } = req.body;

    const trx = await knex.transaction();

    const point = {
      image: req.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      cidade,
      uf
    };
  
    const insertedIds = await trx('points').insert(point);
  
    const point_id = insertedIds[0];
  
    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => 
        (
          {
            item_id,
            point_id,
          }
        )
      )
  
    await trx('point_items').insert(pointItems);

    await trx.commit();
  
    return res.json({ 
      id: point_id,
      ...point
    });  
  }
}

export default PointsController
