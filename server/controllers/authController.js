const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, data: user });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, phone, password, role: 'customer' });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/create-admin (superadmin only)
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await User.create({ name, email, phone, password, role: 'admin' });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/seed-admin — create first admin (run once)
const seedAdmin = async (req, res, next) => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@savoria.com',
      phone: '03001234567',
      password: 'admin123',
      role: 'admin',
    });
    admin.password = undefined;
    res.status(201).json({ success: true, message: 'Admin created! Email: admin@savoria.com | Password: admin123', data: admin });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, createAdmin, getAllUsers, seedAdmin };
