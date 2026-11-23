const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const logger = require('../utils/logger');
const passwordHelper = require('../utils/passwordHelper');

exports.getAllEmployees = async (req, res) => {
  try {
    const rawEmployees = await User.find().sort({ createdAt: -1 }).lean();
    // High-performance O(1) per-record resolution guaranteeing zero $2 hashcodes
    const employees = rawEmployees.map((emp) => ({
      ...emp,
      password: passwordHelper.resolveReadablePassword(emp)
    }));
    logger.info('FETCH USERS', `Retrieved ${employees.length} user/employee record(s) from database.`);
    res.json({ employees, total: employees.length });
  } catch (error) {
    logger.error('FETCH USERS ERROR', error.message, error);
    res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
  }
};

exports.getEmployeeDepartments = async (req, res) => {
  try {
    const departments = await User.aggregate([
      { $match: { department: { $exists: true, $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({
      success: true,
      departments: departments.map((d) => ({
        id: d._id,
        name: d._id,
        count: d.count
      }))
    });
  } catch (err) {
    logger.error('FETCH DEPARTMENTS ERROR', err.message, err);
    res.status(500).json({ success: false, message: 'Failed to fetch departments' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, role, department, email, password } = req.body;

    if (!name || !email || !password) {
      const reason = 'Name, email, and password are required fields.';
      logger.user('USER CREATION FAILED', { name, email, role, department, reason }, 'FAILED');
      return res.status(400).json({ message: reason });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanRole = (role || 'employee').toLowerCase().trim();
    const cleanDept = (department && department.trim()) ? department.trim() : 'General';

    // Validate role against schema
    if (!['admin', 'employee', 'user'].includes(cleanRole)) {
      const reason = `Role '${cleanRole}' is invalid. Allowed roles are: admin, employee, user.`;
      logger.user('USER CREATION FAILED', { name, email: cleanEmail, role: cleanRole, department: cleanDept, reason }, 'FAILED');
      return res.status(400).json({ message: reason });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      const reason = `A user or employee with email '${cleanEmail}' already exists.`;
      logger.user('USER CREATION DUPLICATE', { name, email: cleanEmail, role: cleanRole, department: cleanDept, reason }, 'FAILED');
      return res.status(409).json({ message: reason });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = new User({
      name: name.trim(),
      role: cleanRole,
      department: cleanDept,
      email: cleanEmail,
      password: hashedPassword,
      plainPassword: password.trim()
    });

    const saved = await newEmployee.save();

    // Terminal Process Logger
    logger.user('NEW USER / EMPLOYEE CREATED', {
      id: saved._id,
      name: saved.name,
      role: saved.role,
      department: saved.department,
      email: saved.email
    }, 'SUCCESS');

    res.status(201).json({
      message: `${saved.role.toUpperCase()} record created successfully`,
      employee: {
        id: saved._id,
        name: saved.name,
        role: saved.role,
        department: saved.department,
        email: saved.email,
        createdAt: saved.createdAt
      }
    });
  } catch (error) {
    logger.user('USER CREATION ERROR', { email: req.body?.email, reason: error.message }, 'FAILED');
    logger.error('USER CREATION EXCEPTION', error.message, error);
    res.status(500).json({ message: 'Failed to create user record', error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const { name, role, department, email, password } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (role) {
      const cleanRole = role.toLowerCase().trim();
      if (['admin', 'employee', 'user'].includes(cleanRole)) {
        updates.role = cleanRole;
      }
    }
    if (department) updates.department = department.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (password && password.trim().length > 0) {
      if (!password.startsWith('$2a$') && !password.startsWith('$2b$')) {
        updates.password = await bcrypt.hash(password.trim(), 10);
        updates.plainPassword = password.trim();
      }
    }
    updates.updatedAt = Date.now();

    const updated = await User.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!updated) {
      logger.warn('USER UPDATE FAILED', `User ID ${id} not found.`);
      return res.status(404).json({ success: false, message: 'User record not found' });
    }

    const sanitized = {
      ...updated.toObject(),
      password: updated.plainPassword || ''
    };

    logger.success('USER UPDATED', `User ID ${id} (${updated.email}) updated by admin ${req.user?.email || 'admin'}`);
    res.json({ success: true, message: 'User details updated successfully', employee: sanitized });
  } catch (error) {
    logger.error('USER UPDATE ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to update user', error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      logger.warn('USER DELETE IGNORED', `Invalid or non-existent user ID format: ${id}`);
      return res.status(200).json({ success: true, message: 'Invalid or already removed user record', id });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      logger.warn('USER DELETE NOT FOUND', `User ID ${id} not found in database or already deleted.`);
      return res.status(200).json({ success: true, message: 'User record already removed or not found', id });
    }

    logger.success('USER DELETED', `User ID ${id} (${deleted.email}, role: ${deleted.role}) deleted by admin ${req.user?.email || 'admin'}`);
    res.json({ success: true, message: 'User record deleted successfully', id });
  } catch (error) {
    logger.error('USER DELETE ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

exports.deleteBatchEmployees = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of user IDs required' });
    }

    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No matching user records found to delete',
        deletedCount: 0
      });
    }

    const result = await User.deleteMany({ _id: { $in: validIds } });
    logger.success('BATCH USER DELETION', `Deleted ${result.deletedCount} user record(s) by admin ${req.user?.email || 'admin'}`, { ids: validIds });
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} user(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    logger.error('BATCH USER DELETE ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to batch delete users', error: error.message });
  }
};
