const { Op } = require("sequelize");
const Contract = require("../models/contract");

// Helper function to get contract filter based on user type
const getContractFilter = (id, type, excludeTerminated = false) => {
    const key = type === "contractor" ? "ContractorId" : "ClientId";
    const filter = { [key]: id };

    if (excludeTerminated) {
        filter.status = { [Op.ne]: "terminated" };
    }

    return filter;
};

// Get a contract by ID with access control
const getContractsById = async (req, res) => {
    const { id, type } = req.profile;
    const contractId = req.params.id;

    if (id !== parseInt(contractId)) {
        return res.status(403).json({ error: "Access denied for this contract" });
    }

    try {
        const contracts = await Contract.findAll({ where: getContractFilter(id, type) });
        res.json(contracts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch contracts" });
    }
};

// Get all active contracts for a user
const getContracts = async (req, res) => {
    const { id, type } = req.profile;

    try {
        const contracts = await Contract.findAll({ where: getContractFilter(id, type, true) });
        res.json(contracts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch contracts" });
    }
};

module.exports = {
    getContractsById,
    getContracts,
};
