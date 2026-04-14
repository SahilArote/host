const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// GET /api/orders - returns orders based on role
router.get('/', auth, async (req, res) => {
    try {
        let query = 'SELECT * FROM orders';
        const params = [];

        if (req.user.role === 'sales') {
            query += ' WHERE sales_user_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'factory') {
            query += ' WHERE sent_to_factory = 1 AND status != ?';
            params.push('Pending');
        }

        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.execute(query, params);

        // Fetch items for all orders
        const orders = [];
        for (const o of rows) {
            const [items] = await pool.execute(
                'SELECT product_name as name, qty, weight, price FROM order_items WHERE order_id = ?',
                [o.id]
            );
            orders.push({
                id: o.order_id,
                dbId: o.id,
                customer: o.customer_name,
                phone: o.phone,
                address: o.address || '',
                status: o.status,
                date: new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                total: parseFloat(o.total),
                items: items.map(i => ({ name: i.name, qty: i.qty, weight: i.weight || '', price: parseFloat(i.price || 0) })),
                salesPerson: o.sales_person_name || '',
                sentToFactory: !!o.sent_to_factory,
                returnRemark: o.return_remark || '',
            });
        }

        res.json(orders);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/orders - place new order
router.post('/', auth, async (req, res) => {
    try {
        const { customer, phone, address, items, total } = req.body;
        if (!customer || !phone || !items || items.length === 0) {
            return res.status(400).json({ error: 'Customer info and items required' });
        }

        // Generate order ID
        const orderId = 'SPK-' + Date.now().toString(36).toUpperCase();

        // Get sales person name
        const [userRows] = await pool.execute('SELECT name FROM users WHERE id = ?', [req.user.id]);
        const salesPersonName = userRows.length ? userRows[0].name : '';

        const [result] = await pool.execute(
            `INSERT INTO orders (order_id, customer_name, phone, address, status, total, sales_user_id, sales_person_name, sent_to_factory)
             VALUES (?, ?, ?, ?, 'Pending', ?, ?, ?, 0)`,
            [orderId, customer, phone, address || '', total, req.user.id, salesPersonName]
        );

        const dbOrderId = result.insertId;

        // Insert order items
        for (const item of items) {
            await pool.execute(
                'INSERT INTO order_items (order_id, product_name, qty, weight, price) VALUES (?, ?, ?, ?, ?)',
                [dbOrderId, item.name, item.qty || 1, item.weight || '', item.price || 0]
            );
        }

        // Auto-add customer if not exists
        try {
            await pool.execute(
                'INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)',
                [customer, phone, address || '']
            );
        } catch (e) {
            // Ignore duplicate
        }

        res.status(201).json({
            id: orderId,
            dbId: dbOrderId,
            customer,
            phone,
            address: address || '',
            status: 'Pending',
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            total: parseFloat(total),
            items,
            salesPerson: salesPersonName,
            sentToFactory: false,
            returnRemark: '',
        });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/orders/:orderId/forward - forward to factory
router.put('/:orderId/forward', auth, async (req, res) => {
    try {
        await pool.execute(
            `UPDATE orders SET sent_to_factory = 1, status = CASE WHEN status = 'Pending' THEN 'Ordered' ELSE status END WHERE order_id = ?`,
            [req.params.orderId]
        );
        res.json({ message: 'Forwarded to factory' });
    } catch (err) {
        console.error('Forward order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/orders/:orderId/status - update order status (factory)
router.put('/:orderId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Ordered', 'Processing', 'Out for Delivery', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        await pool.execute(
            'UPDATE orders SET status = ?, return_remark = ? WHERE order_id = ?',
            [status, '', req.params.orderId]
        );
        res.json({ message: 'Status updated' });
    } catch (err) {
        console.error('Update status error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/orders/:orderId/return - return order with remark
router.put('/:orderId/return', auth, async (req, res) => {
    try {
        const { remark } = req.body;
        if (!remark || !remark.trim()) {
            return res.status(400).json({ error: 'Return remark required' });
        }
        await pool.execute(
            'UPDATE orders SET status = ?, return_remark = ? WHERE order_id = ?',
            ['Returned', remark.trim(), req.params.orderId]
        );
        res.json({ message: 'Order returned' });
    } catch (err) {
        console.error('Return order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
