const conf = require('../knexfile');
const env  = 'development';
const knex = require('knex')(conf[env]);

module.exports = knex;

knex.migrate.latest([conf]);