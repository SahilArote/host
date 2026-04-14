const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/products
router.get('/', auth, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, c.name_key as category_key
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             ORDER BY p.id`
        );
        const products = rows.map(p => ({
            id: p.id,
            name: p.name,
            nameMarathi: p.name_marathi,
            nameHindi: p.name_hindi,
            category: p.category_key ? p.category_key.replace('cat', '').toLowerCase() : '',
            categoryId: p.category_id,
            pricePerKg: parseFloat(p.price_per_kg),
            weights: typeof p.weights === 'string' ? JSON.parse(p.weights) : (p.weights || []),
        }));
        res.json(products);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/products
router.post('/', auth, async (req, res) => {
    try {
        const { name, nameMarathi, nameHindi, categoryId, pricePerKg, weights } = req.body;
        if (!name || !pricePerKg) {
            return res.status(400).json({ error: 'Name and price required' });
        }
        const weightsJson = JSON.stringify(weights || []);
        const [result] = await pool.execute(
            'INSERT INTO products (name, name_marathi, name_hindi, category_id, price_per_kg, weights) VALUES (?, ?, ?, ?, ?, ?)',
            [name, nameMarathi || name, nameHindi || name, categoryId || null, pricePerKg, weightsJson]
        );

        // Fetch the category key for response
        let categoryKey = '';
        if (categoryId) {
            const [cats] = await pool.execute('SELECT name_key FROM categories WHERE id = ?', [categoryId]);
            if (cats.length) categoryKey = cats[0].name_key.replace('cat', '').toLowerCase();
        }

        res.status(201).json({
            id: result.insertId,
            name,
            nameMarathi: nameMarathi || name,
            nameHindi: nameHindi || name,
            category: categoryKey,
            categoryId: categoryId || null,
            pricePerKg: parseFloat(pricePerKg),
            weights: weights || [],
        });
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/products/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, nameMarathi, nameHindi, categoryId, pricePerKg, weights } = req.body;
        const weightsJson = JSON.stringify(weights || []);
        await pool.execute(
            'UPDATE products SET name=?, name_marathi=?, name_hindi=?, category_id=?, price_per_kg=?, weights=? WHERE id=?',
            [name, nameMarathi || name, nameHindi || name, categoryId || null, pricePerKg, weightsJson, req.params.id]
        );

        let categoryKey = '';
        if (categoryId) {
            const [cats] = await pool.execute('SELECT name_key FROM categories WHERE id = ?', [categoryId]);
            if (cats.length) categoryKey = cats[0].name_key.replace('cat', '').toLowerCase();
        }

        res.json({
            id: parseInt(req.params.id),
            name,
            nameMarathi: nameMarathi || name,
            nameHindi: nameHindi || name,
            category: categoryKey,
            categoryId: categoryId || null,
            pricePerKg: parseFloat(pricePerKg),
            weights: weights || [],
        });
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/products/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
