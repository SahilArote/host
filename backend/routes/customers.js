const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/customers
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM customers ORDER BY id');
        const customers = rows.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            address: c.address || '',
        }));
        res.json(customers);
    } catch (err) {
        console.error('Get customers error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/customers
router.post('/', auth, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone required' });
        }
        const [result] = await pool.execute(
            'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)',
            [name, phone, address || '']
        );
        res.status(201).json({ id: result.insertId, name, phone, address: address || '' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Phone already exists' });
        }
        console.error('Create customer error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/customers/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        await pool.execute('DELETE FROM customers WHERE id = ?', [req.params.id]);
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        console.error('Delete customer error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
