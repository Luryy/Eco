import knex from 'knex';

import dotenv from 'dotenv'; //should find a way to remove
dotenv.config();

const connection = knex({
    client: 'mysql',
    connection: {
      host : process.env.DB_HOST,
      user : process.env.DB_USER,
      password : process.env.DB_SENHA,
      database : process.env.DB
    },
    useNullAsDefault: true,
  });

  export default connection;