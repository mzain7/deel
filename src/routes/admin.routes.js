const express = require('express');
const {getBestProfession, getBestClients} = require('../controllers/admin.controller');

const router = express.Router();
router.get('/best-profession', getBestProfession );
router.get('/best-clients', getBestClients);

module.exports = router;