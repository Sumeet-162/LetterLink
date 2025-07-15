import validator from 'validator';

export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  // Validate username
  if (!username || !validator.isLength(username, { min: 3 })) {
    errors.push('Username must be at least 3 characters long');
  }

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate password
  if (!password || !validator.isLength(password, { min: 8 })) {
    errors.push('Password must be at least 8 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Validate password
  if (!password || !validator.isLength(password, { min: 8 })) {
    errors.push('Password must be at least 8 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};
