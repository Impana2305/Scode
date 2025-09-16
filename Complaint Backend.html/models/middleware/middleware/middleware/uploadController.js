const fs = require('fs');
const path = require('path');

// Serve complaint images
const getImage = (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(process.env.UPLOAD_PATH || './uploads/complaints', filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Send the image file
    res.sendFile(path.resolve(imagePath));
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while serving image'
    });
  }
};

// Delete an image
const deleteImage = async (req, res) => {
  try {
    const { complaintId, filename } = req.params;
    const userId = req.user._id;

    // Find the complaint
    const complaint = await Complaint.findOne({ 
      _id: complaintId, 
      userId 
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Find the image in the complaint
    const imageIndex = complaint.images.findIndex(img => img.filename === filename);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in complaint'
      });
    }

    // Remove the image file from filesystem
    const imagePath = path.join(process.env.UPLOAD_PATH || './uploads/complaints', filename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove the image from the complaint
    complaint.images.splice(imageIndex, 1);
    await complaint.save();

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting image'
    });
  }
};

module.exports = {
  getImage,
  deleteImage
};