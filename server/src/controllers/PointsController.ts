import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController{

    async index (req: Request, res: Response){
        const { uf, city, items } = req.query;
        
        const parsedItems = String(items)
            .split(',')
            .map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        console.log(points);

        return res.json(points);
    }

    async show (req: Request, res: Response){
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();

        if(!point){
            return res.status(400).json({menssage: "Point not found"});
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return res.json({point, items});
    }

    async create (req: Request, res: Response){
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body
    
    
        const trx = await knex.transaction();

        const point = {
            image: 'https://cdn.pixabay.com/photo/2020/02/12/11/58/recycling-4842491_960_720.png',
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }
    
        const insertedIds = await trx('points').insert(point)
    
        const point_id = insertedIds[0];
        
    
        const pointIds = items.map((item_id: Number)=>{
            return {
                item_id,
                point_id,
            }
        });
    
        await trx('point_items').insert(pointIds);
    
        await trx.commit();
    
        return res.json({
            id: point_id,
            ...point
        });
    }


}

export default PointsController;