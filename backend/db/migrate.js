const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    // Connect WITHOUT database first to create it
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306,
    });

    const dbName = process.env.DB_NAME || 'spkhamkar';
    console.log(`Creating database '${dbName}' if not exists...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await conn.query(`USE \`${dbName}\``);

    console.log('Creating tables...');

    await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            role ENUM('admin','sales','factory') NOT NULL DEFAULT 'sales',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name_key VARCHAR(50) NOT NULL,
            name_en VARCHAR(100) NOT NULL,
            name_mr VARCHAR(100) DEFAULT '',
            name_hi VARCHAR(100) DEFAULT '',
            icon VARCHAR(20) DEFAULT '🍛',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            name_marathi VARCHAR(100) DEFAULT '',
            name_hindi VARCHAR(100) DEFAULT '',
            category_id INT,
            price_per_kg DECIMAL(10,2) NOT NULL,
            weights JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS customers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(15) UNIQUE NOT NULL,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id VARCHAR(20) UNIQUE NOT NULL,
            customer_name VARCHAR(100) NOT NULL,
            phone VARCHAR(15) NOT NULL,
            address TEXT,
            status ENUM('Pending','Ordered','Processing','Out for Delivery','Delivered','Returned') DEFAULT 'Pending',
            total DECIMAL(10,2) NOT NULL DEFAULT 0,
            sales_user_id INT,
            sales_person_name VARCHAR(100) DEFAULT '',
            sent_to_factory TINYINT(1) DEFAULT 0,
            return_remark TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sales_user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    await conn.query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_name VARCHAR(100) NOT NULL,
            qty INT NOT NULL DEFAULT 1,
            weight VARCHAR(20) DEFAULT '',
            price DECIMAL(10,2) DEFAULT 0,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
    `);

    console.log('All tables created successfully!');
    await conn.end();
}

migrate().catch(e => {
    console.error('Migration error:', e);
    process.exit(1);
});
