const express = require('express');
const getProfile = require('../middleware/getProfile');
const {getContractsById, getContracts} = require('../controllers/contracts.controller');

const router = express.Router();
router.get('/:id', getProfile, getContractsById);
router.get('/', getProfile, getContracts);

module.exports = router;