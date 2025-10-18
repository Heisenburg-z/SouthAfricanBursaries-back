const admin = require('firebase-admin');

// Check if environment variables are available
console.log('Firebase Admin Config - Checking environment variables...');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Missing');
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Missing');
console.log('Private Key:', process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Missing');

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
};

try {
  // Check if already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "student-opportunities-ace57.firebasestorage.app"
    });
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.log('✅ Firebase Admin already initialized');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error);
  throw error;
}

const bucket = admin.storage().bucket();
console.log('✅ Firebase Storage bucket ready:', bucket.name);

module.exports = { admin, bucket };