const express = require('express');
const Pincode = require('../models/Pincode');
const Sector = require('../models/Sector');
const router = express.Router();

// Get all sectors
router.get('/', async (req, res) => {
  try {
    const sectors = await Sector.find().populate('pincodes');
    res.json({
      success: true,
      sectors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pincodes by sector
router.get('/:sector/pincodes', async (req, res) => {
  try {
    const { sector } = req.params;
    const pincodes = await Pincode.find({ sector });
    
    res.json({
      success: true,
      pincodes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sector by pincode
router.get('/pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ message: 'Pincode must be 6 digits' });
    }

    const pincodeData = await Pincode.findOne({ pincode });
    if (!pincodeData) {
      return res.status(404).json({ message: 'Pincode not found' });
    }

    res.json({
      success: true,
      sector: pincodeData.sector,
      areaName: pincodeData.areaName,
      availablePools: pincodeData.availablePools
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search pincodes
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const pincodes = await Pincode.find({
      $or: [
        { pincode: { $regex: query, $options: 'i' } },
        { areaName: { $regex: query, $options: 'i' } },
        { sector: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    res.json({
      success: true,
      pincodes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;