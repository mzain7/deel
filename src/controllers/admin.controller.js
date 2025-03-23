const { Op, fn, col, literal } = require("sequelize");
const Contract = require("../models/contract");
const Job = require("../models/job");
const Profile = require("../models/profile");

const getBestProfession = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "start and end query parameters are required" });
  }

  try {
    const bestProfession = await Job.findAll({
      where: {
        paid: true,
        paymentDate: { [Op.between]: [start, end] },
      },
      include: {
        model: Contract,
        required: true,
        attributes: [],
        include: {
          model: Profile,
          as: "Contractor",
          required: true,
          attributes: [],
          where: { type: "contractor" },
        },
      },
      attributes: [
        [fn("SUM", col("price")), "total_earnings"],
        [col("Contract.Contractor.profession"), "profession"],
      ],
      group: ["profession"],
      order: [["total_earnings", "DESC"]],
      limit: 1,
      raw: true,
    });

    res.json({
      bestProfession: bestProfession || { profession: null, earnings: 0 },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBestClients = async (req, res) => {
  const { start, end, limit = 2 } = req.query;
  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "start and end query parameters are required" });
  }

  try {
    const bestClients = await Job.findAll({
      where: {
        paid: true,
        paymentDate: { [Op.between]: [start, end] },
      },
      include: {
        model: Contract,
        required: true,
        attributes: [],
        include: {
          model: Profile,
          as: "Client",
          required: true,
          attributes: [],
          where: { type: "client" },
        },
      },
      attributes: [
        [fn("SUM", col("price")), "totalPaid"],
        [col("Contract.Client.id"), "id"],
        [
          fn(
            "CONCAT",
            col("Contract.Client.firstName"),
            " ",
            col("Contract.Client.lastName")
          ),
          "fullName",
        ],
      ],
      group: ["Contract.Client.id"],
      order: [[col("totalPaid"), "DESC"]],
      limit: parseInt(limit, 10),
      raw: true,
    });

    res.json({ bestClients });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getBestProfession, getBestClients };
