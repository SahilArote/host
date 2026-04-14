const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/categories
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM categories ORDER BY id');
        const categories = rows.map(c => ({
            id: c.name_key ? c.name_key.replace('cat', '').toLowerCase() : String(c.id),
            dbId: c.id,
            nameKey: c.name_key,
            nameEn: c.name_en,
            nameMr: c.name_mr,
            nameHi: c.name_hi,
            icon: c.icon,
        }));
        res.json(categories);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/categories
router.post('/', auth, async (req, res) => {
    try {
        const { nameEn, nameMr, nameHi, icon } = req.body;
        if (!nameEn) {
            return res.status(400).json({ error: 'Name required' });
        }
        const nameKey = 'cat' + nameEn.charAt(0).toUpperCase() + nameEn.slice(1).toLowerCase().replace(/\s+/g, '');
        const [result] = await pool.execute(
            'INSERT INTO categories (name_key, name_en, name_mr, name_hi, icon) VALUES (?, ?, ?, ?, ?)',
            [nameKey, nameEn, nameMr || nameEn, nameHi || nameEn, icon || '🍛']
        );
        res.status(201).json({
            id: nameKey.replace('cat', '').toLowerCase(),
            dbId: result.insertId,
            nameKey,
            nameEn,
            nameMr: nameMr || nameEn,
            nameHi: nameHi || nameEn,
            icon: icon || '🍛',
        });
    } catch (err) {
        console.error('Create category error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/categories/:dbId
router.delete('/:dbId', auth, async (req, res) => {
    try {
        await pool.execute('DELETE FROM categories WHERE id = ?', [req.params.dbId]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
