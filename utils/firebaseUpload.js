const { storage } = require('../config/firebase');
const { ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images and documents only!');
  }
}

// Upload file to Firebase Storage
const uploadToFirebase = async (file, folder = 'general') => {
  try {
    // Create a unique filename with user ID if available
    const timestamp = Date.now();
    let filename;
    
    if (folder && file.originalname) {
      filename = `${folder}/${timestamp}_${file.originalname.replace(/\s+/g, '_')}`;
    } else {
      filename = `general/${timestamp}_${file.originalname}`;
    }
    
    console.log('Uploading file to Firebase:', filename);
    
    // Create a storage reference
    const storageRef = ref(storage, filename);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file.buffer, {
      contentType: file.mimetype,
    });
    
    console.log('File uploaded successfully, getting download URL...');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Download URL obtained:', downloadURL);
    
    return {
      filename: file.originalname,
      firebaseName: filename,
      downloadURL,
      contentType: file.mimetype,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading to Firebase:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// Delete file from Firebase Storage
const deleteFromFirebase = async (firebaseName) => {
  try {
    console.log('Deleting file from Firebase:', firebaseName);
    
    // Create a reference to the file to delete
    const desertRef = ref(storage, firebaseName);

    // Delete the file
    await deleteObject(desertRef);
    console.log('File deleted successfully from Firebase');
    return true;
  } catch (error) {
    console.error('Error deleting from Firebase:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

module.exports = {
  upload,
  uploadToFirebase,
  deleteFromFirebase
};