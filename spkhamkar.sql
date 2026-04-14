-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: spkhamkar
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name_key` varchar(50) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `name_mr` varchar(100) DEFAULT '',
  `name_hi` varchar(100) DEFAULT '',
  `icon` varchar(20) DEFAULT '?',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_name` varchar(100) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `weight` varchar(20) DEFAULT '',
  `price` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,'Haldi Sangli',2,'500g',180.00),(2,2,'Mirchi Sankeshwari',3,'250g',60.00),(3,3,'Cardamom',2,'100g',192.00),(4,3,'Black Pepper',1,'250g',160.00),(5,4,'Kitchen King',1,'500g',280.00),(6,5,'Garam Masala',1,'250g',175.00),(7,5,'Jeera (Cumin)',1,'500g',220.00),(8,6,'Haldi Erode',2,'500g',200.00),(9,7,'Garam Masala',1,'250g',175.00),(10,8,'Haldi Sangli',2,'500g',180.00),(11,8,'Jeera (Cumin)',1,'250g',110.00),(12,9,'Black Pepper',1,'500g',320.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` varchar(20) NOT NULL,
  `customer_name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `address` text DEFAULT NULL,
  `status` enum('Pending','Ordered','Processing','Out for Delivery','Delivered','Returned') DEFAULT 'Pending',
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sales_user_id` int(11) DEFAULT NULL,
  `sales_person_name` varchar(100) DEFAULT '',
  `sent_to_factory` tinyint(1) DEFAULT 0,
  `return_remark` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `sales_user_id` (`sales_user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`sales_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'SPK-001','Rajesh Patil','9876543210','Pune','Processing',892.50,2,'Ramesh Khamkar',1,'','2026-04-03 19:15:54'),(2,'SPK-002','Sunita Deshmukh','9123456789','Mumbai','Ordered',567.00,2,'Ramesh Khamkar',1,'','2026-04-03 19:15:54'),(3,'SPK-003','Rajesh Patil','9876543210','Pune','Processing',1260.00,3,'Sunil Patil',1,NULL,'2026-04-03 19:15:54'),(4,'SPK-004','Priya Sharma','7654321098','Nashik','Ordered',430.50,3,'Sunil Patil',1,NULL,'2026-04-03 19:15:54'),(5,'SPK-005','Amit Joshi','8888000011','Kolhapur','Delivered',520.00,2,'Ramesh Khamkar',1,'','2026-04-03 19:15:54'),(6,'SPK-006','Sonal Patil','9090909090','Sangli','Pending',360.00,3,'Sunil Patil',0,NULL,'2026-04-03 19:15:54'),(7,'SPK-H01','Rajesh Patil','9876543210','Pune','Delivered',750.00,2,'Ramesh Khamkar',1,NULL,'2026-04-03 19:15:54'),(8,'SPK-H02','Sonal Patil','9090909090','Sangli','Delivered',1120.00,3,'Sunil Patil',1,NULL,'2026-04-03 19:15:54'),(9,'SPK-H03','Amit Joshi','8888000011','Kolhapur','Delivered',640.00,2,'Ramesh Khamkar',1,'','2026-04-03 19:15:54');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `name_marathi` varchar(100) DEFAULT '',
  `name_hindi` varchar(100) DEFAULT '',
  `category_id` int(11) DEFAULT NULL,
  `price_per_kg` decimal(10,2) NOT NULL,
  `weights` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`weights`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('admin','sales','factory') NOT NULL DEFAULT 'sales',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$1Oii1J/OI9/rlrMms3p4mOb/xW0uWm47QukOBfPZiPRwFE1L5De02','Admin','admin','2026-04-03 19:15:54'),(2,'sales1','$2a$10$WfOgiDRsh/roG.KJTUQADe3o05AJFncMo8uv6i.hExp6boDIvYZ8S','Ramesh Khamkar','sales','2026-04-03 19:15:54'),(3,'sales2','$2a$10$WfOgiDRsh/roG.KJTUQADe3o05AJFncMo8uv6i.hExp6boDIvYZ8S','Sunil Patil','sales','2026-04-03 19:15:54'),(4,'factory','$2a$10$kBq0OFpT8ZBRYNLP93dTLePsmRckJd3pzkEL3QV4JIXYZdZvNC8DG','Manoj Jadhav','factory','2026-04-03 19:15:54');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-14 10:33:45
