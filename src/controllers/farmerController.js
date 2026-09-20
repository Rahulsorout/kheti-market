// src/controllers/farmerController.js

// Temporary sample data (later we will connect MongoDB model)
const sampleContracts = [
  { id: 1, crop: "Wheat", price: 2500, company: "AgriCorp" },
  { id: 2, crop: "Tomato", price: 18, company: "FreshFoods" },
];

const getAvailableContracts = (req, res) => {
  res.json({
    message: "Available contract offers",
    contracts: sampleContracts,
  });
};

module.exports = {
  getAvailableContracts,
};
