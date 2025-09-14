const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: 'Pincode must be 6 digits'
    }
  },
  sector: {
    type: String,
    required: true
  },
  areaName: {
    type: String,
    required: true
  },
  availablePools: [{
    type: String
  }]
});

module.exports = mongoose.model('Pincode', pincodeSchema);