const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/users - list all users (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, username, name, role, created_at FROM users ORDER BY id');
        const roleNames = { admin: 'Administrator', sales: 'Sales Person', factory: 'Factory Manager' };
        const users = rows.map(u => ({ ...u, roleName: roleNames[u.role] || u.role }));
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/users - create user (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { username, password, name, role } = req.body;
        if (!username || !password || !name) {
            return res.status(400).json({ error: 'All fields required' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
            [username, hashed, name, role || 'sales']
        );

        const roleNames = { admin: 'Administrator', sales: 'Sales Person', factory: 'Factory Manager' };
        res.status(201).json({
            id: result.insertId,
            username,
            name,
            role: role || 'sales',
            roleName: roleNames[role || 'sales']
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Username already exists' });
        }
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/users/:id - delete user (admin only, cannot delete self)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }
        await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
