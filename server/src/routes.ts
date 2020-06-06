import express from 'express';
import knex from './database/connection';

import multer from 'multer';
import multerConfig from './config/multer';

import verification from './config/verification';

import PointsController from './controllers/PointsController';
const pointsController = new PointsController();

import ItemsController from './controllers/ItemsController';
const itemsController = new ItemsController();

const routes = express.Router();

const uploads = multer(multerConfig);

routes.get('/items', itemsController.index);

routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);
routes.post('/points',uploads.single('image'), verification ,pointsController.create);


export default routes;
