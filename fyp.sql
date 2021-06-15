-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- 主機: 127.0.0.1
-- 產生時間： 2020-03-07 13:50:15
-- 伺服器版本: 10.1.30-MariaDB
-- PHP 版本： 5.6.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `fyp`
--

-- --------------------------------------------------------

--
-- 資料表結構 `contact`
--

CREATE TABLE `contact` (
  `contact_number` int(11) NOT NULL,
  `contact_name` varchar(255) NOT NULL,
  `contact_avatar` varchar(255) NOT NULL,
  `user_user_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `contact_device`
--

CREATE TABLE `contact_device` (
  `device_id` int(11) NOT NULL,
  `device_name` varchar(255) NOT NULL,
  `device_type` char(1) NOT NULL,
  `contact_contact_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `friend_list`
--

CREATE TABLE `friend_list` (
  `user1` int(11) NOT NULL,
  `user2` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- 資料表的匯出資料 `friend_list`
--

INSERT INTO `friend_list` (`user1`, `user2`) VALUES
(1, 180108083),
(1, 180108084),
(180108083, 1),
(180108083, 180108084),
(180108084, 1),
(180108084, 180108083);

-- --------------------------------------------------------

--
-- 資料表結構 `message_box`
--

CREATE TABLE `message_box` (
  `message_id` int(255) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `user`
--

CREATE TABLE `user` (
  `user_number` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_avatar` varchar(255) NOT NULL,
  `user_password` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- 資料表的匯出資料 `user`
--

INSERT INTO `user` (`user_number`, `user_name`, `user_avatar`, `user_password`) VALUES
(1, 'a', 'a', 1),
(180108083, 'sam1', 'sam1', 123),
(180108084, 'a', 'sam', 123);

-- --------------------------------------------------------

--
-- 資料表結構 `user_device`
--

CREATE TABLE `user_device` (
  `device_id` int(11) NOT NULL,
  `device_name` varchar(255) NOT NULL,
  `device_type` char(1) NOT NULL,
  `user_user_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `video_conference`
--

CREATE TABLE `video_conference` (
  `video_conference_id` varchar(255) NOT NULL,
  `video_conference_name` varchar(255) NOT NULL,
  `user_device_id` int(11) NOT NULL,
  `contact_device_device_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- 資料表結構 `video_record`
--

CREATE TABLE `video_record` (
  `video_record_id` varchar(255) NOT NULL,
  `video_owner` varchar(255) NOT NULL,
  `video_peer` varchar(255) NOT NULL,
  `video_record_timestamp_start` varchar(255) NOT NULL,
  `video_length` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- 已匯出資料表的索引
--

--
-- 資料表索引 `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`contact_number`),
  ADD KEY `contact_user` (`user_user_number`);

--
-- 資料表索引 `contact_device`
--
ALTER TABLE `contact_device`
  ADD PRIMARY KEY (`device_id`),
  ADD KEY `contact_device_contact` (`contact_contact_number`);

--
-- 資料表索引 `friend_list`
--
ALTER TABLE `friend_list`
  ADD PRIMARY KEY (`user1`,`user2`),
  ADD KEY `fk2` (`user2`);

--
-- 資料表索引 `message_box`
--
ALTER TABLE `message_box`
  ADD PRIMARY KEY (`message_id`);

--
-- 資料表索引 `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_number`);

--
-- 資料表索引 `user_device`
--
ALTER TABLE `user_device`
  ADD PRIMARY KEY (`device_id`),
  ADD KEY `device_user` (`user_user_number`);

--
-- 資料表索引 `video_conference`
--
ALTER TABLE `video_conference`
  ADD PRIMARY KEY (`video_conference_id`),
  ADD KEY `video_conference_contact_device` (`contact_device_device_id`),
  ADD KEY `video_conference_device` (`user_device_id`);

--
-- 資料表索引 `video_record`
--
ALTER TABLE `video_record`
  ADD PRIMARY KEY (`video_record_id`);

--
-- 在匯出的資料表使用 AUTO_INCREMENT
--

--
-- 使用資料表 AUTO_INCREMENT `message_box`
--
ALTER TABLE `message_box`
  MODIFY `message_id` int(255) NOT NULL AUTO_INCREMENT;

--
-- 使用資料表 AUTO_INCREMENT `user`
--
ALTER TABLE `user`
  MODIFY `user_number` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=180108085;

--
-- 已匯出資料表的限制(Constraint)
--

--
-- 資料表的 Constraints `contact`
--
ALTER TABLE `contact`
  ADD CONSTRAINT `contact_user` FOREIGN KEY (`user_user_number`) REFERENCES `user` (`user_number`);

--
-- 資料表的 Constraints `contact_device`
--
ALTER TABLE `contact_device`
  ADD CONSTRAINT `contact_device_contact` FOREIGN KEY (`contact_contact_number`) REFERENCES `contact` (`contact_number`);

--
-- 資料表的 Constraints `friend_list`
--
ALTER TABLE `friend_list`
  ADD CONSTRAINT `fk1` FOREIGN KEY (`user1`) REFERENCES `user` (`user_number`),
  ADD CONSTRAINT `fk2` FOREIGN KEY (`user2`) REFERENCES `user` (`user_number`);

--
-- 資料表的 Constraints `user_device`
--
ALTER TABLE `user_device`
  ADD CONSTRAINT `device_user` FOREIGN KEY (`user_user_number`) REFERENCES `user` (`user_number`);

--
-- 資料表的 Constraints `video_conference`
--
ALTER TABLE `video_conference`
  ADD CONSTRAINT `video_conference_contact_device` FOREIGN KEY (`contact_device_device_id`) REFERENCES `contact_device` (`device_id`),
  ADD CONSTRAINT `video_conference_device` FOREIGN KEY (`user_device_id`) REFERENCES `user_device` (`device_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
