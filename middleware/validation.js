const validateUserRegistration = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = [];

  if (!firstName || firstName.trim() === '') {
    errors.push('First name is required');
  }
  
  if (!lastName || lastName.trim() === '') {
    errors.push('Last name is required');
  }
  
  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please include a valid email');
  }
  
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please include a valid email');
  }
  
  if (!password) {
    errors.push('Password is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

const validateOpportunity = (req, res, next) => {
  const { title, description, type, provider, applicationDeadline } = req.body;
  const errors = [];
  const validTypes = ['Bursary', 'Internship', 'Graduate Program', 'Learnership'];

  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!description || description.trim() === '') {
    errors.push('Description is required');
  }
  
  if (!type || !validTypes.includes(type)) {
    errors.push('Invalid opportunity type');
  }
  
  if (!provider || provider.trim() === '') {
    errors.push('Provider is required');
  }
  
  if (!applicationDeadline || isNaN(Date.parse(applicationDeadline))) {
    errors.push('Valid application deadline is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateOpportunity
};