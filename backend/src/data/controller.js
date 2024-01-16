const pool = require('../../db')
const queries = require('./queries')

const getData = (req, res) => {
  pool.query(queries.getData, (error, results) => {
    if (error) throw error
    res.status(200).json(results.rows)
  })
}

module.exports = {
  getData
}