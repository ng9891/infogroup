// uses connection string from file postgres.env 
'use strict'
const path = require('path');

const envFile = require('node-env-file')
envFile(path.join(__dirname, './postgres.env'));

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host : process.env.POSTGRES_NETLOC,
      port : process.env.POSTGRES_PORT || undefined,
      user : process.env.POSTGRES_USER,
      password : process.env.POSTGRES_PASSWORD || undefined,
      database : process.env.POSTGRES_DB,
      charset: 'utf8'
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    }
  }

};
