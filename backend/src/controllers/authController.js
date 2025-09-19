const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken } = require('../middleware/auth');
const UserService = require('../services/userService');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  const { username, email, password } = value;

  if (UserService.emailExists(email)) {
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists'
    });
  }



  if (UserService.usernameExists(username)) {
    return res.status(400).json({
      success: false,
      error: 'Username already taken'
    });
  }









  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = UserService.createUser({
    username,
    email,
    password: hashedPassword
  });




  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  const { email, password } = value;

  const user = UserService.findUserByEmail(email);






  console.log('User found:', user);













  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);



  console.log('Password valid:', isPasswordValid);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }




  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    }
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = UserService.findUserById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      }
    }
  });
});

const getStats = asyncHandler(async (req, res) => {
  const totalUsers = UserService.getUserCount();

  res.json({
    success: true,
    data: {
      totalUsers,
      systemInfo: {
        version: '1.0.0',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      }
    }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  getStats
};
