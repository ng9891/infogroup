'use strict'
const path = require('path')
const pg_js = require('pg')

//const Pool = pg_native.Pool
const Pool = pg_js.Pool

const envFile = require('node-env-file')
envFile(path.join(__dirname, './postgres.env'))


const config = {
  host     : process.env.POSTGRES_NETLOC,
  port     : process.env.POSTGRES_PORT || undefined,
  user     : process.env.POSTGRES_USER,
  password : process.env.POSTGRES_PASSWORD || undefined,
  database : process.env.POSTGRES_DB,
  max      : 40
}

process.on('unhandledRejection', (err) => {
  if (err && !err.message.match(/^NOTICE/)) {
    console.log(err.message || err.stack)
  }
})

const pool = new Pool(config)

 //code based on example found here: https://github.com/brianc/node-postgres/wiki/Example
const runQuery = (text, values, cb) => pool.query(text, values, cb)

module.exports = {
  runQuery
}