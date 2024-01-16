const express = require('express')
const app = express()
const dataRoutes = require('./src/data/routes')
const cors = require('cors')
const port = 3000

app.use(cors())

app.use('/api/Skripsi', dataRoutes)

app.listen(port, () => {
  console.log(`Server listen to port ${port}`);
})