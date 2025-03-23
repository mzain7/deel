const { Op } = require("sequelize");
const Profile = require("../models/profile");
const Contract = require("../models/contract");
const Job = require("../models/job");
const sequelize = require("../config/database");

const depositMoney = async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { id, type } = req.profile;
  const amountToDeposit = Number(req.body.amount);

  if (id !== userId) {
    return res.status(403).json({ error: "Only self deposit allowed" });
  }

  if (type !== "client") {
    return res.status(403).json({ error: "Only clients can deposit money" });
  }

  if (amountToDeposit <= 0 || isNaN(amountToDeposit)) {
    return res.status(400).json({ error: "Invalid deposit amount" });
  }

  try {
    const client = await Profile.findByPk(userId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    const clientBalance = client.balance;

    const sumOfUnpaidJobs = await Job.sum("price", {
      where: { paid: false },
      include: {
        model: Contract,
        where: { ClientId: userId },
      },
    });

    const depositLimit = sumOfUnpaidJobs ? sumOfUnpaidJobs / 4 : 0;
    if (amountToDeposit > depositLimit) {
      return res.status(403).json({ error: "Deposit exceeds allowed limit" });
    }

    await sequelize.transaction(async (t) => {
      await client.update(
        { balance: sequelize.literal(`balance + ${amountToDeposit}`) },
        { transaction: t }
      );
    });

    return res.json({ message: "Deposit successful", balance: clientBalance + amountToDeposit });
  } catch (error) {
    console.error("Deposit Error:", error);
    return res.status(500).json({ error: "Transaction failed" });
  }
};

module.exports = {
  depositMoney,
};
