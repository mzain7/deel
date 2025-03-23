const { Op } = require("sequelize");
const Contract = require("../models/contract");
const Job = require("../models/job");
const Profile = require("../models/profile");
const sequelize = require("../config/database");

const getUnpaidJobs = async (req, res) => {
    const { id, type } = req.profile;

    if (!['contractor', 'client'].includes(type)) {
        return res.status(400).json({ error: "Invalid user type" });
    }

    try {
        const contracts = await Contract.findAll({
            attributes: ["id", "ClientId", "ContractorId", "status"],
            where: {
                [type === "contractor" ? "ContractorId" : "ClientId"]: id,
                status: "in_progress",
            },
            include: {
                model: Job,
                where: { paid: false },
                required: true, // Ensures only contracts with unpaid jobs are returned
            },
        });

        if (!contracts.length) return res.status(404).json({ error: "No unpaid jobs found" });

        res.json(contracts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch unpaid jobs" });
    }
};

const payForJob = async (req, res) => {
    const jobId = req.params.job_id;
    const { id: clientId, type } = req.profile;

    if (type === "contractor") return res.status(403).json({ error: "Only clients can pay for a job" });

    try {
        const job = await Job.findOne({
            where: { id: jobId },
            include: {
                model: Contract,
                attributes: ["ContractorId", "ClientId"],
                required: true,
            },
        });

        if (!job) return res.status(404).json({ error: "Job not found" });
        if (job.paid) return res.status(403).json({ error: "Job already paid" });

        if (job.Contract.ClientId !== clientId) {
            return res.status(403).json({ error: "Unauthorized: You can only pay for your own job" });
        }

        const { ContractorId } = job.Contract;

        // Fetch contractor and client in a single query
        const profiles = await Profile.findAll({
            where: { id: { [Op.in]: [ContractorId, clientId] } },
            attributes: ["id", "balance"],
        });

        const contractor = profiles.find((p) => p.id === ContractorId);
        const client = profiles.find((p) => p.id === clientId);

        if (!contractor || !client) return res.status(404).json({ error: "Client or Contractor not found" });

        if (client.balance < job.price) return res.status(403).json({ error: "Insufficient balance" });

        await sequelize.transaction(async (t) => {
            await contractor.update({ balance: contractor.balance + job.price }, { transaction: t });
            await client.update({ balance: client.balance - job.price }, { transaction: t });
            await job.update({ paid: true, paymentDate: new Date() }, { transaction: t });
        });

        res.json({ message: "Payment successful", job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Transaction failed" });
    }
};

module.exports = {
    getUnpaidJobs,
    payForJob,
};
