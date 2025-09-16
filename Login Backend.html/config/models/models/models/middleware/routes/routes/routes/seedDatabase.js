// seedDatabase.js
const mongoose = require('mongoose');
const Pincode = require('./models/Pincode');
const Sector = require('./models/Sector');
const dotenv = require('dotenv');

dotenv.config();

const pincodes = [
  // Bengaluru
  { pincode: '560001', sector: 'Bengaluru', areaName: 'Central Bengaluru', availablePools: ['IT Sector', 'Government Services', 'Urban Development'] },
  { pincode: '560002', sector: 'Bengaluru', areaName: 'Majestic Area', availablePools: ['Transportation', 'Commerce', 'Retail'] },
  { pincode: '560003', sector: 'Bengaluru', areaName: 'Chickpet', availablePools: ['Textile Industry', 'Commerce', 'Retail'] },
  { pincode: '560004', sector: 'Bengaluru', areaName: 'City Market', availablePools: ['Agriculture Markets', 'Commerce', 'Retail'] },
  { pincode: '560005', sector: 'Bengaluru', areaName: 'Shivajinagar', availablePools: ['Commerce', 'Retail', 'Small Businesses'] },
  { pincode: '560006', sector: 'Bengaluru', areaName: 'Gandhinagar', availablePools: ['Commerce', 'Retail', 'Wholesale Markets'] },
  { pincode: '560007', sector: 'Bengaluru', areaName: 'Basavanagudi', availablePools: ['Education', 'Cultural Activities', 'Retail'] },
  { pincode: '560008', sector: 'Bengaluru', areaName: 'Jayanagar', availablePools: ['Residential Services', 'Retail', 'Healthcare'] },
  { pincode: '560009', sector: 'Bengaluru', areaName: 'JP Nagar', availablePools: ['Residential Services', 'Retail', 'Education'] },
  { pincode: '560010', sector: 'Bengaluru', areaName: 'Whitefield', availablePools: ['IT Sector', 'Technology Services', 'Residential'] },

  // Mysore
  { pincode: '570001', sector: 'Mysore', areaName: 'Central Mysore', availablePools: ['Tourism', 'Cultural Heritage', 'Government Services'] },
  { pincode: '570002', sector: 'Mysore', areaName: 'Nazarbad', availablePools: ['Residential Services', 'Retail', 'Education'] },
  { pincode: '570003', sector: 'Mysore', areaName: 'Vijaynagar', availablePools: ['Residential Services', 'Retail', 'Healthcare'] },
  { pincode: '570004', sector: 'Mysore', areaName: 'Kuvempunagar', availablePools: ['Education', 'Residential Services', 'Retail'] },
  { pincode: '570005', sector: 'Mysore', areaName: 'Gokulam', availablePools: ['Education', 'Residential Services', 'Healthcare'] },
  { pincode: '570006', sector: 'Mysore', areaName: 'TK Layout', availablePools: ['Residential Services', 'Retail', 'Small Businesses'] },
  { pincode: '570007', sector: 'Mysore', areaName: 'Ramakrishnanagar', availablePools: ['Residential Services', 'Education', 'Healthcare'] },
  { pincode: '570008', sector: 'Mysore', areaName: 'Jayanagar', availablePools: ['Residential Services', 'Retail', 'Cultural Activities'] },
  { pincode: '570009', sector: 'Mysore', areaName: 'Hinkal', availablePools: ['Residential Services', 'Small Industries', 'Retail'] },
  { pincode: '570010', sector: 'Mysore', areaName: 'Bogadi', availablePools: ['Residential Services', 'Education', 'Retail'] },

  // Add more pincodes for other sectors as needed
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Pincode.deleteMany({});
    await Sector.deleteMany({});

    // Insert pincodes
    await Pincode.insertMany(pincodes);
    console.log('Pincodes inserted successfully');

    // Create sectors from pincodes
    const sectorsMap = new Map();
    
    for (const pincode of pincodes) {
      if (!sectorsMap.has(pincode.sector)) {
        sectorsMap.set(pincode.sector, {
          name: pincode.sector,
          pincodes: [],
          availablePools: []
        });
      }
      
      const sector = sectorsMap.get(pincode.sector);
      sector.pincodes.push(pincode.pincode);
      
      // Add unique pools
      pincode.availablePools.forEach(pool => {
        if (!sector.availablePools.includes(pool)) {
          sector.availablePools.push(pool);
        }
      });
    }

    // Insert sectors
    const sectors = Array.from(sectorsMap.values());
    await Sector.insertMany(sectors);
    console.log('Sectors inserted successfully');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();