const mongoose = require('mongoose');

const sectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  pincodes: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{6}$/.test(v);
      },
      message: 'Pincode must be 6 digits'
    }
  }],
  availablePools: [{
    type: String
  }],
  description: {
    type: String
  }
});

module.exports = mongoose.model('Sector', sectorSchema);