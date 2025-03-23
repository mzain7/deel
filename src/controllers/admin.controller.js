const { Op, fn, col, literal } = require("sequelize");
const Contract = require("../models/contract");
const Job = require("../models/job");
const Profile = require("../models/profile");

const getBestProfession = async (req, res) => {
  const { start, end } = req.query;
  
  try {
    const bestProfession = await Profile.findOne({
      attributes: [
        'profession',
        [fn('COALESCE', fn('SUM', col('Contracts.Jobs.price')), 0), 'totalEarnings']
      ],
      include: {
        model: Contract,
        as: 'Contracts',
        attributes: [],
        include: {
          model: Job,
          attributes: [],
          where: {
            paid: true,
            paymentDate: { [Op.between]: [start, end] },
          },
        },
      },
      group: ['profession'],
      order: [[literal('totalEarnings'), 'DESC']],
      limit: 1,
      raw: true,
    });

    res.json({ bestProfession: bestProfession || { profession: null, earnings: 0 } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getBestClients = async (req, res) => {
  const { start, end, limit = 2 } = req.query;

  try {
    const bestClients = await Profile.findAll({
      attributes: [
        'id',
        [literal("firstName || ' ' || lastName"), 'fullName'], // Concatenates first and last name for SQLite
        [fn('SUM', col('Contracts.Jobs.price')), 'totalPaid']
      ],
      include: {
        model: Contract,
        as: 'Contracts',
        attributes: [],
        include: {
          model: Job,
          attributes: [],
          where: {
            paid: true,
            paymentDate: { [Op.between]: [start, end] },
          },
        },
      },
      group: ['Profile.id'],
      order: [[col('totalPaid'), 'DESC']],
      limit: parseInt(limit, 10),
      raw: true,
    });

    res.json({ bestClients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getBestProfession, getBestClients };
