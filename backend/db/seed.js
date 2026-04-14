const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
    console.log('Seeding database...');

    // Hash passwords
    const adminHash = await bcrypt.hash('admin', 10);
    const salesHash = await bcrypt.hash('sales', 10);
    const factoryHash = await bcrypt.hash('factory', 10);

    // Insert users (ignore if already exist)
    const users = [
        ['admin', adminHash, 'Admin', 'admin'],
        ['sales1', salesHash, 'Ramesh Khamkar', 'sales'],
        ['sales2', salesHash, 'Sunil Patil', 'sales'],
        ['factory', factoryHash, 'Manoj Jadhav', 'factory'],
    ];

    for (const u of users) {
        try {
            await pool.execute(
                'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
                u
            );
            console.log(`  User '${u[0]}' created`);
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                console.log(`  User '${u[0]}' already exists, skipping`);
            } else {
                throw e;
            }
        }
    }

    // Insert sample orders
    const [salesUsers] = await pool.execute('SELECT id, username, name FROM users WHERE role = ?', ['sales']);
    const sales1 = salesUsers.find(u => u.username === 'sales1');
    const sales2 = salesUsers.find(u => u.username === 'sales2');

    const [existingOrders] = await pool.execute('SELECT COUNT(*) as cnt FROM orders');
    if (existingOrders[0].cnt === 0) {
        const orders = [
            ['SPK-001', 'Rajesh Patil', '9876543210', 'Pune', 'Processing', 892.50, sales1?.id, sales1?.name || 'Ramesh Khamkar', 1],
            ['SPK-002', 'Sunita Deshmukh', '9123456789', 'Mumbai', 'Out for Delivery', 567.00, sales1?.id, sales1?.name || 'Ramesh Khamkar', 1],
            ['SPK-003', 'Rajesh Patil', '9876543210', 'Pune', 'Processing', 1260.00, sales2?.id, sales2?.name || 'Sunil Patil', 1],
            ['SPK-004', 'Priya Sharma', '7654321098', 'Nashik', 'Ordered', 430.50, sales2?.id, sales2?.name || 'Sunil Patil', 1],
            ['SPK-005', 'Amit Joshi', '8888000011', 'Kolhapur', 'Pending', 520.00, sales1?.id, sales1?.name || 'Ramesh Khamkar', 0],
            ['SPK-006', 'Sonal Patil', '9090909090', 'Sangli', 'Pending', 360.00, sales2?.id, sales2?.name || 'Sunil Patil', 0],
            ['SPK-H01', 'Rajesh Patil', '9876543210', 'Pune', 'Delivered', 750.00, sales1?.id, sales1?.name || 'Ramesh Khamkar', 1],
            ['SPK-H02', 'Sonal Patil', '9090909090', 'Sangli', 'Delivered', 1120.00, sales2?.id, sales2?.name || 'Sunil Patil', 1],
            ['SPK-H03', 'Amit Joshi', '8888000011', 'Kolhapur', 'Delivered', 640.00, sales1?.id, sales1?.name || 'Ramesh Khamkar', 1],
        ];

        for (const o of orders) {
            const [result] = await pool.execute(
                'INSERT INTO orders (order_id, customer_name, phone, address, status, total, sales_user_id, sales_person_name, sent_to_factory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                o
            );

            // Add sample items per order
            const orderId = result.insertId;
            const itemsMap = {
                'SPK-001': [['Haldi Sangli', 2, '500g', 180]],
                'SPK-002': [['Mirchi Sankeshwari', 3, '250g', 60]],
                'SPK-003': [['Cardamom', 2, '100g', 192], ['Black Pepper', 1, '250g', 160]],
                'SPK-004': [['Kitchen King', 1, '500g', 280]],
                'SPK-005': [['Garam Masala', 1, '250g', 175], ['Jeera (Cumin)', 1, '500g', 220]],
                'SPK-006': [['Haldi Erode', 2, '500g', 200]],
                'SPK-H01': [['Garam Masala', 1, '250g', 175]],
                'SPK-H02': [['Haldi Sangli', 2, '500g', 180], ['Jeera (Cumin)', 1, '250g', 110]],
                'SPK-H03': [['Black Pepper', 1, '500g', 320]],
            };
            const items = itemsMap[o[0]] || [];
            for (const item of items) {
                await pool.execute(
                    'INSERT INTO order_items (order_id, product_name, qty, weight, price) VALUES (?, ?, ?, ?, ?)',
                    [orderId, ...item]
                );
            }
        }
        console.log('  Sample orders seeded');
    }

    console.log('Seeding complete!');
    process.exit(0);
}

seed().catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
});
