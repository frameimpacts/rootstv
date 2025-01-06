-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: localhost    Database: rootstv
-- ------------------------------------------------------
-- Server version	8.0.40-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `content`
--

DROP TABLE IF EXISTS `content`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `content` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `type` enum('movie','show','short') COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `thumbnail_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `content_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `trailer_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `genre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `release_year` int DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('normal','featured','trending') COLLATE utf8mb4_general_ci DEFAULT 'normal',
  `featured_order` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_featured_order` (`featured_order`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `content`
--

LOCK TABLES `content` WRITE;
/*!40000 ALTER TABLE `content` DISABLE KEYS */;
INSERT INTO `content` VALUES (1,'Nisa Lhumkon','Nice','movie',566.00,'/thumbnails/Nisa-Lhumkon-l-CoZZ_KU--1735209180019-858775584.jpg','<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4WCLkWVY6gI?si=jzHV9a7ogc96eW2r\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" r','<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4WCLkWVY6gI?si=jzHV9a7ogc96eW2r\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" r','drama,comedy,romance',2024,678,'2024-12-24 07:41:34','featured',NULL);
/*!40000 ALTER TABLE `content` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `order_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payment_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `payment_session_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `order_token` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `user_id` (`user_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (61,2,1,566.00,'paid','order_1735498246381_8dewjjluw',NULL,'2024-12-29 18:50:46','2024-12-29 18:51:06','session_MUk72D1bwmZ286vQi3c7pYXkAUs2t3tGq0MwTNpx9cItEd0rljv0ZKXnG84WR-pYzwS_HWGYNWO17MOz1nfkb2rovP01s70-UXtyU7v6DAhmgarLy9fz7hGypQpaymentpayment',NULL),(62,3,1,566.00,'active','order_1735507576285_nxty0n845',NULL,'2024-12-29 21:26:16','2024-12-29 21:26:43','session_35e0XcioHqjXwEnPqYFj3oCE79v5jut-7c5i1H4UvMc_4AxduKExNZb_T3U0aUBPOpQ2Gho6Hrbyn5fp5eX5m_zaLreH_NcEYYhaWhTeh_X0EcAr0XApA7dGkQpaymentpayment',NULL),(63,3,1,566.00,'pending','order_1735507642774_qm6y1sazm',NULL,'2024-12-29 21:27:22','2024-12-29 21:27:23','session_TYjzNc5wEUKwP_0soTTvavgkZH5SCByMZPoqEpcLg47uzsnC9U-n0wLpQbp7bVnDwLSekg8I0duNAIEpjknNz8G_vVajkofd3WQbGTtB10dEtqIyKZwbDXS_XApaymentpayment',NULL),(64,3,1,566.00,'active','order_1735507679472_q9g5fzfyg',NULL,'2024-12-29 21:27:59','2024-12-29 21:28:27','session_wUoiGo_k9yc5HfZxz37gL1SZrVaUNqExsNtM_qrL1X_HYv55J-OtrZXhdaxyy0tvCXaDUjqN3g7TYia45skuDXaa_4LOV1pg6Yw66r1zyDanqA53GwpI7j4-6gpaymentpayment',NULL),(65,3,1,566.00,'active','order_1735508169460_ehy5zhulq',NULL,'2024-12-29 21:36:09','2024-12-29 21:36:41','session_402sQ1u8C_EDp5kifaPp8woOVhnfxf6tmstqUgvixPR1sJ53shaoeOdOLjLM8K9CZ8ybCJpnjlo1rHp6fQdJ1YyhcT_2MdzoLZuchf5oy9SWcM1Cwro9ahzfFgpaymentpayment',NULL),(66,3,1,566.00,'paid','order_1735508228414_zw7ym9rix',NULL,'2024-12-29 21:37:08','2024-12-29 21:37:36','session_auPp06EVBpzudZDCorkAe1Wv4SMla3naVs1qfYo6nPHogcziQlwsx8giAk-As_y4M05e0gY2YYTTZ13Hx5kjsqHu86AL9Q0YAPo2SKYJyxllr3kxqKP-8r0ZGApaymentpayment',NULL),(67,3,1,566.00,'pending','order_1735513357890_90u5wv0ll',NULL,'2024-12-29 23:02:37','2024-12-29 23:02:38','session_iIE439e5c7ZVFWtLE6dHyq1rV_B_yEXKicLrw0SUNpDtWJE0MuGSKjGbB6pUoXK3L7zPyVC9jE3OLHVBVZsD3iLU4UFkWyknbP4lsnvgRCMt50ixNYO7zjrwtwpaymentpayment',NULL),(68,3,1,566.00,'pending','order_1735533118968_rqs9ws5zn',NULL,'2024-12-30 04:31:58','2024-12-30 04:31:59','session_hsI0DXCm1IGclXsridAWtgZwT0q33N7Vo25zuJuJmnm4ricDdA5WBjFti-mLy8o_tOpZ7lNGXG5oLxFS0nSLUo43P-WiP2HaCXmtmlhNo4V2R_MXG8_oByw62gpaymentpayment',NULL),(69,4,1,566.00,'paid','order_1735547949182_izr3nv0qf',NULL,'2024-12-30 08:39:09','2024-12-30 08:40:12','session_Q0aWzcEiXotBt7LxLjs06Rd14RAwXC9JdP5HNXEOFxEsB3xiB_qGvq2d2nsnOcspQXm-bEgzgjrcLSMJHlAr_5cMjRUSrNelY3f4t9xffbm5P-88HjFxe_o0Twpaymentpayment',NULL),(70,7,1,566.00,'active','order_1735553757791_eqydjmj5r',NULL,'2024-12-30 10:15:57','2024-12-30 10:16:13','session_nsoG5wh1I2ODmCvuWGa10a4s8VMywgiC1MqLloMP4TYj_yMTvt4SmSKvn4ndfRojq2fquQ4IyLJTwOcKy2_NntsPLEFMwbWFIOk2mY3VHkINZC05Ojv0i2T70Qpaymentpayment',NULL),(71,7,1,566.00,'active','order_1735553788473_c403nv7zk',NULL,'2024-12-30 10:16:28','2024-12-30 10:16:36','session_5nFH5BJ6G1T2Fh77mCxYy8Who3o0n4NScfLKlS3KFsMNsWSpg7ZsbfOfBX21I8WgjjDwsZU-C2Z0Lfgesn4mdgRk5JJ2UXSP8eOIrvgCcriJiUxPG5xHDY0jJQpaymentpayment',NULL),(72,7,1,566.00,'paid','order_1735553992649_dzkkyhruz',NULL,'2024-12-30 10:19:52','2024-12-30 10:20:06','session_bDVebjzu7OpKheik_CeE3e1g9pbZYVUNbmK9JyrKjdp3d3nLHokp0VIgadO92Gvl0p_Ib-hRuuPAVDm4LFA8oXzVR7m_tIi5EU9EuhA6XuighxN_xXFrrsD1awpaymentpayment',NULL),(73,7,1,566.00,'pending','order_1735582980237_gzt0kqsmv',NULL,'2024-12-30 18:23:00','2024-12-30 18:23:00',NULL,NULL),(74,7,1,566.00,'pending','order_1735583168537_kzmtpfpkk',NULL,'2024-12-30 18:26:08','2024-12-30 18:26:08',NULL,NULL),(75,7,1,566.00,'pending','order_1735625723601_jphbvy13g',NULL,'2024-12-31 06:15:23','2024-12-31 06:15:23',NULL,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `content_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `purchase_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `content_id` (`content_id`),
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (2,2,1,566.00,'2024-12-29 18:51:06'),(3,3,1,566.00,'2024-12-29 21:37:36'),(4,4,1,566.00,'2024-12-30 08:40:12'),(5,7,1,566.00,'2024-12-30 10:20:06');
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_general_ci DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'admin@example.com','$2a$10$xNqs9PaqtQcma41.v7AdUOSsbtcqkMOMY1WqFcjMdDOVZAUWaE9eC','Admin User','admin','2024-12-24 07:14:51','8837404545'),(3,'fawkthiis@gmail.com','$2a$10$aeQzX28fNYi/eKLCANyx0ur.P.mHnjulkZ1OiF2hynKiGIgSqxn8K','sensix','user','2024-12-24 09:07:43','9856504768'),(4,'lamkafilmacademy@gmail.com','$2a$10$NWv7rKQYXwqPx9uTnuwhK.5yow5fpxchpaSpZ0/o0n0EUmd1TUJb6','George AK Neihsial','user','2024-12-30 08:38:49',NULL),(5,'buongigangte065@gmail.com','$2a$10$chN2NU5n.8PcE1WCiDnNxurvRNIIhgOfdgMiL8jCdSZcouqtschce','Buongi Gangte','user','2024-12-30 10:07:27',NULL),(6,'kipgenchochoi2@gmail.com','$2a$10$2Sp5eEOApKx80UlWQL8jE.ubCwlSQBRDdJfXOjH599EAQiFkE1ija','Lhingchoihoi','user','2024-12-30 10:09:59',NULL),(7,'joshsya7@gmail.com','$2a$10$uq1W.GCLhpKmaWAcPOcy3uQzBhlLB1tAYUOgwpcUzVmwTBGnfin2.','lapjn','user','2024-12-30 10:15:35','8837404545'),(8,'kou2ngamlhing@gmail.com','$2a$10$xPOodqvQXhKB3327EkKzoeRVMRDgweQabnrBQ.uUJxjJnfIw47Cny','Ngamthenthang Haokip','user','2024-12-31 05:53:00','6909156864'),(9,'gvirusboloyank@gmail.com','$2a$10$kh8EwO5yzjRBrXrJLiVobOMZHTseIbskLQhUBFP8/vw97OGnMNn/i','Curlyvirus ','user','2024-12-31 07:55:30','7005800866');
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

-- Dump completed on 2024-12-31  8:00:53
-- Table for people (actors, directors, etc.)
CREATE TABLE `people` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role_type` enum('actor','director','both') NOT NULL,
  `profile_image` varchar(255),
  `bio` text,
  `birth_date` date,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_role_type` (`role_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Junction table for content and directors
CREATE TABLE `content_directors` (
  `content_id` int NOT NULL,
  `person_id` int NOT NULL,
  PRIMARY KEY (`content_id`, `person_id`),
  FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Junction table for content and cast (actors)
CREATE TABLE `content_cast` (
  `content_id` int NOT NULL,
  `person_id` int NOT NULL,
  `character_name` varchar(255),
  `role_order` int DEFAULT 0,
  PRIMARY KEY (`content_id`, `person_id`),
  FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`person_id`) REFERENCES `people`(`id`) ON DELETE CASCADE,
  KEY `idx_role_order` (`role_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;