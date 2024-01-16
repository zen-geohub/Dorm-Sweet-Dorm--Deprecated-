const { Router } = require('express')
const router = Router()
const controller = require('./controller')

router.get(('/getData'), controller.getData)

module.exports = router