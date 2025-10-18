const { bucket } = require('../config/firebaseAdmin');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images and documents only!'));
    }
  }
});

// Upload file to Firebase Storage using Admin SDK
const uploadToFirebase = async (file, folder = 'general') => {
  try {
    console.log('🚀 Starting Firebase Admin upload...');
    console.log('File:', file.originalname, 'Size:', file.size, 'Type:', file.mimetype);
    console.log('Folder:', folder);

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${folder}/${timestamp}_${file.originalname.replace(/\s+/g, '_')}`;
    
    console.log('📁 Uploading to:', filename);
    
    // Create a file reference
    const fileRef = bucket.file(filename);
    
    // Upload the file
    console.log('⬆️ Uploading file...');
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });
    
    console.log('✅ File uploaded successfully, making public...');
    
    // Make the file publicly accessible
    await fileRef.makePublic();
    
    // Get the public URL
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    
    console.log('🔗 Download URL:', downloadURL);
    
    return {
      filename: file.originalname,
      firebaseName: filename,
      downloadURL: downloadURL,
      contentType: file.mimetype,
      size: file.size
    };
  } catch (error) {
    console.error('🔥 FIREBASE ADMIN UPLOAD ERROR:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// Delete file from Firebase Storage
const deleteFromFirebase = async (firebaseName) => {
  try {
    console.log('🗑️ Deleting file from Firebase:', firebaseName);
    
    const fileRef = bucket.file(firebaseName);
    await fileRef.delete();
    
    console.log('✅ File deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ Error deleting from Firebase:', error);
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

module.exports = {
  upload,
  uploadToFirebase,
  deleteFromFirebase
};