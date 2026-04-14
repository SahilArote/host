-- SP Khamkar & Sons - Database Schema
-- Run this file to create the database and tables

CREATE DATABASE IF NOT EXISTS spkhamkar;
USE spkhamkar;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin','sales','factory') NOT NULL DEFAULT 'sales',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_key VARCHAR(50) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_mr VARCHAR(100) DEFAULT '',
    name_hi VARCHAR(100) DEFAULT '',
    icon VARCHAR(20) DEFAULT '🍛',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
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
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    address TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address TEXT DEFAULT '',
    status ENUM('Pending','Ordered','Processing','Out for Delivery','Delivered','Returned') DEFAULT 'Pending',
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    sales_user_id INT,
    sales_person_name VARCHAR(100) DEFAULT '',
    sent_to_factory TINYINT(1) DEFAULT 0,
    return_remark TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    qty INT NOT NULL DEFAULT 1,
    weight VARCHAR(20) DEFAULT '',
    price DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- =============================================
-- SEED DATA
-- =============================================

-- Default users (passwords will be hashed by the seed script)
-- admin/admin, sales1/sales, sales2/sales, factory/factory

-- Seed Categories
INSERT INTO categories (name_key, name_en, name_mr, name_hi, icon) VALUES
('catMirchi', 'Chilli', 'मिरची', 'मिर्च', '🌶️'),
('catHaldi', 'Turmeric', 'हळद', 'हल्दी', '💛'),
('catMasala', 'Masalas', 'मसाले', 'मसाले', '🫙'),
('catWhole', 'Whole', 'साबूत', 'साबुत', '🫘'),
('catFresh', 'Fresh', 'ताजे', 'ताज़ा', '🌿');

-- Seed Products (category_id references above inserts: 1=Chilli, 2=Turmeric, 3=Masalas, 4=Whole, 5=Fresh)
INSERT INTO products (name, name_marathi, name_hindi, category_id, price_per_kg, weights) VALUES
('Mirchi Sankeshwari', 'मिरची संकेश्वरी', 'मिर्च संकेश्वरी', 1, 80.00, '["100g","250g","500g","1 kg"]'),
('Mirchi Kashmiri', 'मिरची काश्मिरी', 'मिर्च कश्मीरी', 1, 120.00, '["100g","250g","500g","1 kg"]'),
('Mirchi Guntur', 'मिरची गुंटूर', 'मिर्च गुंटूर', 1, 100.00, '["100g","250g","500g","1 kg"]'),
('Haldi Sangli', 'हळद सांगली', 'हल्दी सांगली', 2, 180.00, '["100g","250g","500g","1 kg"]'),
('Haldi Erode', 'हळद इरोड', 'हल्दी इरोड', 2, 200.00, '["100g","250g","500g","1 kg"]'),
('Jeera (Cumin)', 'जिरे', 'जीरा', 4, 440.00, '["100g","250g","500g","1 kg"]'),
('Coriander Powder', 'धणे पावडर', 'धनिया पाउडर', 3, 260.00, '["100g","250g","500g","1 kg"]'),
('Black Pepper', 'काळी मिरी', 'काली मिर्च', 4, 640.00, '["50g","100g","250g","500g"]'),
('Garam Masala', 'गरम मसाला', 'गरम मसाला', 3, 700.00, '["50g","100g","250g","500g"]'),
('Kitchen King', 'किचन किंग', 'किचन किंग', 3, 560.00, '["100g","250g","500g","1 kg"]'),
('Cardamom', 'वेलची', 'इलायची', 4, 960.00, '["25g","50g","100g","250g"]'),
('Cinnamon (Dalchini)', 'दालचिनी', 'दालचीनी', 4, 560.00, '["50g","100g","250g","500g"]'),
('Fresh Ginger', 'आलं', 'अदरक', 5, 120.00, '["250g","500g","1 kg"]'),
('Fresh Garlic', 'लसूण', 'लहसुन', 5, 100.00, '["250g","500g","1 kg"]'),
('Fenugreek (Methi)', 'मेथी दाणे', 'मेथी दाना', 4, 180.00, '["100g","250g","500g","1 kg"]');

-- Seed Customers
INSERT INTO customers (name, phone, address) VALUES
('Rajesh Patil', '9876543210', 'Pune'),
('Sunita Deshmukh', '9123456789', 'Mumbai'),
('Priya Sharma', '7654321098', 'Nashik'),
('Sonal Patil', '9090909090', 'Sangli'),
('Amit Joshi', '8888000011', 'Kolhapur');
