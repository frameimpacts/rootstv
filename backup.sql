-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 06, 2025 at 07:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rootstv`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  `parent_comment_id` int(11) DEFAULT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `content_id`, `parent_comment_id`, `comment`, `created_at`, `updated_at`) VALUES
(17, 2, 1, NULL, 'hi', '2025-01-04 19:26:09', '2025-01-04 19:26:09'),
(19, 2, 1, NULL, 'ko', '2025-01-04 19:26:51', '2025-01-04 19:26:51'),
(21, 2, 1, 19, 'hehe', '2025-01-04 19:30:32', '2025-01-04 19:30:32');

-- --------------------------------------------------------

--
-- Table structure for table `content`
--

CREATE TABLE `content` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('movie','show','short') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `content_url` varchar(255) DEFAULT NULL,
  `trailer_url` varchar(255) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  `release_year` int(11) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('normal','featured','trending') DEFAULT 'normal',
  `featured_order` int(11) DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `rating` decimal(3,1) DEFAULT 0.0,
  `total_ratings` int(11) DEFAULT 0,
  `rental_duration` int(11) DEFAULT 7,
  `subscription_type` enum('basic','premium') DEFAULT 'basic'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `content`
--

INSERT INTO `content` (`id`, `title`, `description`, `type`, `price`, `thumbnail_url`, `content_url`, `trailer_url`, `genre`, `release_year`, `duration`, `created_at`, `status`, `featured_order`, `views`, `rating`, `total_ratings`, `rental_duration`, `subscription_type`) VALUES
(1, 'Nisa Lhumkon', 'Nice', 'movie', 566.00, '/thumbnails/Nisa-Lhumkon-l-CoZZ_KU--1735209180019-858775584.jpg', '<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4WCLkWVY6gI?si=jzHV9a7ogc96eW2r\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" r', '<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/4WCLkWVY6gI?si=jzHV9a7ogc96eW2r\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" r', 'drama,comedy,romance', 2024, 678, '2024-12-24 07:41:34', 'featured', 0, 0, 0.0, 0, 7, 'basic');

-- --------------------------------------------------------

--
-- Table structure for table `content_cast`
--

CREATE TABLE `content_cast` (
  `content_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `character_name` varchar(255) DEFAULT NULL,
  `role_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `content_directors`
--

CREATE TABLE `content_directors` (
  `content_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `content_directors`
--

INSERT INTO `content_directors` (`content_id`, `person_id`) VALUES
(1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `order_id` varchar(100) DEFAULT NULL,
  `payment_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `payment_session_id` varchar(255) DEFAULT NULL,
  `order_token` varchar(255) DEFAULT NULL,
  `rental_duration` int(11) DEFAULT 7
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `content_id`, `amount`, `status`, `order_id`, `payment_id`, `created_at`, `updated_at`, `payment_session_id`, `order_token`, `rental_duration`) VALUES
(61, 2, 1, 566.00, 'paid', 'order_1735498246381_8dewjjluw', NULL, '2024-12-29 18:50:46', '2024-12-29 18:51:06', 'session_MUk72D1bwmZ286vQi3c7pYXkAUs2t3tGq0MwTNpx9cItEd0rljv0ZKXnG84WR-pYzwS_HWGYNWO17MOz1nfkb2rovP01s70-UXtyU7v6DAhmgarLy9fz7hGypQpaymentpayment', NULL, 7),
(62, 3, 1, 566.00, 'active', 'order_1735507576285_nxty0n845', NULL, '2024-12-29 21:26:16', '2024-12-29 21:26:43', 'session_35e0XcioHqjXwEnPqYFj3oCE79v5jut-7c5i1H4UvMc_4AxduKExNZb_T3U0aUBPOpQ2Gho6Hrbyn5fp5eX5m_zaLreH_NcEYYhaWhTeh_X0EcAr0XApA7dGkQpaymentpayment', NULL, 7),
(63, 3, 1, 566.00, 'pending', 'order_1735507642774_qm6y1sazm', NULL, '2024-12-29 21:27:22', '2024-12-29 21:27:23', 'session_TYjzNc5wEUKwP_0soTTvavgkZH5SCByMZPoqEpcLg47uzsnC9U-n0wLpQbp7bVnDwLSekg8I0duNAIEpjknNz8G_vVajkofd3WQbGTtB10dEtqIyKZwbDXS_XApaymentpayment', NULL, 7),
(64, 3, 1, 566.00, 'active', 'order_1735507679472_q9g5fzfyg', NULL, '2024-12-29 21:27:59', '2024-12-29 21:28:27', 'session_wUoiGo_k9yc5HfZxz37gL1SZrVaUNqExsNtM_qrL1X_HYv55J-OtrZXhdaxyy0tvCXaDUjqN3g7TYia45skuDXaa_4LOV1pg6Yw66r1zyDanqA53GwpI7j4-6gpaymentpayment', NULL, 7),
(65, 3, 1, 566.00, 'active', 'order_1735508169460_ehy5zhulq', NULL, '2024-12-29 21:36:09', '2024-12-29 21:36:41', 'session_402sQ1u8C_EDp5kifaPp8woOVhnfxf6tmstqUgvixPR1sJ53shaoeOdOLjLM8K9CZ8ybCJpnjlo1rHp6fQdJ1YyhcT_2MdzoLZuchf5oy9SWcM1Cwro9ahzfFgpaymentpayment', NULL, 7),
(66, 3, 1, 566.00, 'paid', 'order_1735508228414_zw7ym9rix', NULL, '2024-12-29 21:37:08', '2024-12-29 21:37:36', 'session_auPp06EVBpzudZDCorkAe1Wv4SMla3naVs1qfYo6nPHogcziQlwsx8giAk-As_y4M05e0gY2YYTTZ13Hx5kjsqHu86AL9Q0YAPo2SKYJyxllr3kxqKP-8r0ZGApaymentpayment', NULL, 7),
(67, 3, 1, 566.00, 'pending', 'order_1735513357890_90u5wv0ll', NULL, '2024-12-29 23:02:37', '2024-12-29 23:02:38', 'session_iIE439e5c7ZVFWtLE6dHyq1rV_B_yEXKicLrw0SUNpDtWJE0MuGSKjGbB6pUoXK3L7zPyVC9jE3OLHVBVZsD3iLU4UFkWyknbP4lsnvgRCMt50ixNYO7zjrwtwpaymentpayment', NULL, 7),
(68, 3, 1, 566.00, 'pending', 'order_1735533118968_rqs9ws5zn', NULL, '2024-12-30 04:31:58', '2024-12-30 04:31:59', 'session_hsI0DXCm1IGclXsridAWtgZwT0q33N7Vo25zuJuJmnm4ricDdA5WBjFti-mLy8o_tOpZ7lNGXG5oLxFS0nSLUo43P-WiP2HaCXmtmlhNo4V2R_MXG8_oByw62gpaymentpayment', NULL, 7),
(69, 4, 1, 566.00, 'paid', 'order_1735547949182_izr3nv0qf', NULL, '2024-12-30 08:39:09', '2024-12-30 08:40:12', 'session_Q0aWzcEiXotBt7LxLjs06Rd14RAwXC9JdP5HNXEOFxEsB3xiB_qGvq2d2nsnOcspQXm-bEgzgjrcLSMJHlAr_5cMjRUSrNelY3f4t9xffbm5P-88HjFxe_o0Twpaymentpayment', NULL, 7),
(70, 7, 1, 566.00, 'active', 'order_1735553757791_eqydjmj5r', NULL, '2024-12-30 10:15:57', '2024-12-30 10:16:13', 'session_nsoG5wh1I2ODmCvuWGa10a4s8VMywgiC1MqLloMP4TYj_yMTvt4SmSKvn4ndfRojq2fquQ4IyLJTwOcKy2_NntsPLEFMwbWFIOk2mY3VHkINZC05Ojv0i2T70Qpaymentpayment', NULL, 7),
(71, 7, 1, 566.00, 'active', 'order_1735553788473_c403nv7zk', NULL, '2024-12-30 10:16:28', '2024-12-30 10:16:36', 'session_5nFH5BJ6G1T2Fh77mCxYy8Who3o0n4NScfLKlS3KFsMNsWSpg7ZsbfOfBX21I8WgjjDwsZU-C2Z0Lfgesn4mdgRk5JJ2UXSP8eOIrvgCcriJiUxPG5xHDY0jJQpaymentpayment', NULL, 7),
(72, 7, 1, 566.00, 'paid', 'order_1735553992649_dzkkyhruz', NULL, '2024-12-30 10:19:52', '2024-12-30 10:20:06', 'session_bDVebjzu7OpKheik_CeE3e1g9pbZYVUNbmK9JyrKjdp3d3nLHokp0VIgadO92Gvl0p_Ib-hRuuPAVDm4LFA8oXzVR7m_tIi5EU9EuhA6XuighxN_xXFrrsD1awpaymentpayment', NULL, 7),
(73, 7, 1, 566.00, 'pending', 'order_1735582980237_gzt0kqsmv', NULL, '2024-12-30 18:23:00', '2024-12-30 18:23:00', NULL, NULL, 7),
(74, 7, 1, 566.00, 'pending', 'order_1735583168537_kzmtpfpkk', NULL, '2024-12-30 18:26:08', '2024-12-30 18:26:08', NULL, NULL, 7),
(75, 7, 1, 566.00, 'pending', 'order_1735625723601_jphbvy13g', NULL, '2024-12-31 06:15:23', '2024-12-31 06:15:23', NULL, NULL, 7),
(76, 2, 1, 566.00, 'pending', 'order_1735648634001_3x07hfp7t', NULL, '2024-12-31 12:37:14', '2024-12-31 12:37:14', NULL, NULL, 7),
(77, 2, 1, 566.00, 'pending', 'order_1735806903093_8ijodgs0i', NULL, '2025-01-02 08:35:03', '2025-01-02 08:35:03', NULL, NULL, 7),
(78, 2, 1, 566.00, 'pending', 'order_1735817732536_ey8u9y49f', NULL, '2025-01-02 11:35:32', '2025-01-02 11:35:32', NULL, NULL, 7),
(79, 7, 1, 566.00, 'pending', 'order_1736143834176_wc01i7bmk', NULL, '2025-01-06 06:10:34', '2025-01-06 06:10:34', NULL, NULL, 7);

-- --------------------------------------------------------

--
-- Table structure for table `people`
--

CREATE TABLE `people` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role_type` enum('actor','director','both') NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `people`
--

INSERT INTO `people` (`id`, `name`, `role_type`, `profile_image`, `bio`, `birth_date`, `created_at`) VALUES
(1, 'john', 'director', '/uploads/people/person-1735814549074-285596584.png', 'oaindaks', '2025-01-25', '2025-01-02 10:42:30');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `content_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `purchase_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('active','expired') DEFAULT 'active',
  `rental_duration` int(11) DEFAULT 7
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `user_id`, `content_id`, `amount`, `purchase_date`, `status`, `rental_duration`) VALUES
(2, 2, 1, 566.00, '2024-12-30 18:51:06', 'active', 7),
(3, 3, 1, 566.00, '2024-12-29 21:37:36', 'active', 7),
(4, 4, 1, 566.00, '2024-12-30 08:40:12', 'active', 7),
(5, 7, 1, 566.00, '2024-12-30 03:20:06', 'expired', 7);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `content_id`, `rating`, `created_at`, `updated_at`) VALUES
(3, 2, 1, 4, '2025-01-02 07:56:31', '2025-01-04 20:05:30'),
(4, 7, 1, 5, '2025-01-06 05:43:27', '2025-01-06 05:43:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `phone` varchar(15) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('active','suspended','banned') DEFAULT 'active',
  `subscription_type` enum('basic','premium') DEFAULT 'basic',
  `subscription_end` timestamp NULL DEFAULT NULL,
  `verification_token` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `phone`, `last_login`, `status`, `subscription_type`, `subscription_end`, `verification_token`, `reset_token`, `reset_token_expires`) VALUES
(2, 'admin@example.com', '$2a$10$xNqs9PaqtQcma41.v7AdUOSsbtcqkMOMY1WqFcjMdDOVZAUWaE9eC', 'Admin User', 'admin', '2024-12-24 07:14:51', '8837404545', '2025-01-06 05:17:59', 'active', 'basic', NULL, NULL, NULL, NULL),
(3, 'fawkthiis@gmail.com', '$2a$10$aeQzX28fNYi/eKLCANyx0ur.P.mHnjulkZ1OiF2hynKiGIgSqxn8K', 'sensix', 'user', '2024-12-24 09:07:43', '9856504768', NULL, 'active', 'basic', NULL, NULL, NULL, NULL),
(4, 'lamkafilmacademy@gmail.com', '$2a$10$NWv7rKQYXwqPx9uTnuwhK.5yow5fpxchpaSpZ0/o0n0EUmd1TUJb6', 'George AK Neihsial', 'user', '2024-12-30 08:38:49', NULL, NULL, 'active', 'basic', NULL, NULL, NULL, NULL),
(5, 'buongigangte065@gmail.com', '$2a$10$chN2NU5n.8PcE1WCiDnNxurvRNIIhgOfdgMiL8jCdSZcouqtschce', 'Buongi Gangte', 'user', '2024-12-30 10:07:27', NULL, NULL, 'active', 'basic', NULL, NULL, NULL, NULL),
(6, 'kipgenchochoi2@gmail.com', '$2a$10$2Sp5eEOApKx80UlWQL8jE.ubCwlSQBRDdJfXOjH599EAQiFkE1ija', 'Lhingchoihoi', 'user', '2024-12-30 10:09:59', NULL, NULL, 'active', 'basic', NULL, NULL, NULL, NULL),
(7, 'joshsya7@gmail.com', '$2a$10$uq1W.GCLhpKmaWAcPOcy3uQzBhlLB1tAYUOgwpcUzVmwTBGnfin2.', 'sensix', 'user', '2024-12-30 10:15:35', '8837404545', '2025-01-06 05:40:35', 'active', 'basic', NULL, NULL, NULL, NULL),
(8, 'kou2ngamlhing@gmail.com', '$2a$10$xPOodqvQXhKB3327EkKzoeRVMRDgweQabnrBQ.uUJxjJnfIw47Cny', 'Ngamthenthang Haokip', 'user', '2024-12-31 05:53:00', '6909156864', NULL, 'active', 'basic', NULL, NULL, NULL, NULL),
(9, 'gvirusboloyank@gmail.com', '$2a$10$kh8EwO5yzjRBrXrJLiVobOMZHTseIbskLQhUBFP8/vw97OGnMNn/i', 'Curlyvirus ', 'user', '2024-12-31 07:55:30', '7005800866', NULL, 'active', 'basic', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `watchlist`
--

CREATE TABLE `watchlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `watch_history`
--

CREATE TABLE `watch_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_id` int(11) NOT NULL,
  `progress` int(11) DEFAULT 0,
  `last_watched` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `content_id` (`content_id`),
  ADD KEY `parent_comment_id` (`parent_comment_id`);

--
-- Indexes for table `content`
--
ALTER TABLE `content`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_featured_order` (`featured_order`);

--
-- Indexes for table `content_cast`
--
ALTER TABLE `content_cast`
  ADD PRIMARY KEY (`content_id`,`person_id`),
  ADD KEY `person_id` (`person_id`),
  ADD KEY `idx_role_order` (`role_order`);

--
-- Indexes for table `content_directors`
--
ALTER TABLE `content_directors`
  ADD PRIMARY KEY (`content_id`,`person_id`),
  ADD KEY `person_id` (`person_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `content_id` (`content_id`);

--
-- Indexes for table `people`
--
ALTER TABLE `people`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_role_type` (`role_type`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `content_id` (`content_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `content_id` (`content_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `watchlist`
--
ALTER TABLE `watchlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `content_id` (`content_id`);

--
-- Indexes for table `watch_history`
--
ALTER TABLE `watch_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `content_id` (`content_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `content`
--
ALTER TABLE `content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `people`
--
ALTER TABLE `people`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `watchlist`
--
ALTER TABLE `watchlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `watch_history`
--
ALTER TABLE `watch_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`),
  ADD CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_comment_id`) REFERENCES `comments` (`id`);

--
-- Constraints for table `content_cast`
--
ALTER TABLE `content_cast`
  ADD CONSTRAINT `content_cast_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `content_cast_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `people` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `content_directors`
--
ALTER TABLE `content_directors`
  ADD CONSTRAINT `content_directors_ibfk_1` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `content_directors_ibfk_2` FOREIGN KEY (`person_id`) REFERENCES `people` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`);

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`);

--
-- Constraints for table `watchlist`
--
ALTER TABLE `watchlist`
  ADD CONSTRAINT `watchlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `watchlist_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`);

--
-- Constraints for table `watch_history`
--
ALTER TABLE `watch_history`
  ADD CONSTRAINT `watch_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `watch_history_ibfk_2` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
