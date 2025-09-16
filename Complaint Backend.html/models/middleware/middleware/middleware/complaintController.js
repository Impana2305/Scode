const Complaint = require('../models/Complaint');
const User = require('../models/User');

// Create a new complaint
const createComplaint = async (req, res) => {
  try {
    const { type, priority, title, description, location } = req.body;
    const userId = req.user._id;

    // Create complaint
    const complaint = new Complaint({
      userId,
      type,
      priority,
      title,
      description,
      location: location || ''
    });

    // Add image information if files were uploaded
    if (req.files && req.files.length > 0) {
      complaint.images = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size
      }));
    }

    await complaint.save();

    // Add complaint to user's complaints array
    await User.findByIdAndUpdate(userId, {
      $push: { complaints: complaint._id }
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint: {
        id: complaint.complaintId,
        title: complaint.title,
        type: complaint.type,
        priority: complaint.priority,
        status: complaint.status,
        createdAt: complaint.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating complaint'
    });
  }
};

// Get all complaints for a user
const getUserComplaints = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const complaints = await Complaint.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-userId -__v');

    const total = await Complaint.countDocuments({ userId });

    res.json({
      success: true,
      complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaints'
    });
  }
};

// Get a single complaint by ID
const getComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const complaint = await Complaint.findOne({ 
      _id: id, 
      userId 
    }).select('-userId -__v');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaint'
    });
  }
};

// Search complaints
const searchComplaints = async (req, res) => {
  try {
    const userId = req.user._id;
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const complaints = await Complaint.find({
      userId,
      $or: [
        { complaintId: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 }).select('-userId -__v');

    res.json({
      success: true,
      complaints
    });
  } catch (error) {
    console.error('Error searching complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching complaints'
    });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getComplaint,
  searchComplaints
};