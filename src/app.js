const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./config/database')
const adminRoutes = require('./routes/admin.routes');
const balancesRoutes = require('./routes/balances.routes');
const jobsRoutes = require('./routes/jobs.routes');
const contractsRoutes = require('./routes/contracts.routes');
const app = express();
app.use(bodyParser.json());

app.use('/contracts', contractsRoutes);
app.use('/jobs', jobsRoutes);
app.use('/balances', balancesRoutes);
app.use('/admin', adminRoutes);

module.exports = app;
