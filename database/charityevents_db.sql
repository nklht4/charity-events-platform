/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50622
Source Host           : localhost:3306
Source Database       : charityevents_db

Target Server Type    : MYSQL
Target Server Version : 50622
File Encoding         : 65001

Date: 2025-10-06 17:01:46
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `CategoryID` int(10) NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(100) NOT NULL,
  PRIMARY KEY (`CategoryID`),
  UNIQUE KEY `CategoryName` (`CategoryName`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES ('7', 'Art Exhibition');
INSERT INTO `categories` VALUES ('4', 'Concert');
INSERT INTO `categories` VALUES ('8', 'Food Festival');
INSERT INTO `categories` VALUES ('2', 'Fun Run');
INSERT INTO `categories` VALUES ('1', 'Gala Dinner');
INSERT INTO `categories` VALUES ('3', 'Silent Auction');
INSERT INTO `categories` VALUES ('6', 'Sports Tournament');
INSERT INTO `categories` VALUES ('5', 'Workshop');

-- ----------------------------
-- Table structure for events
-- ----------------------------
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `EventID` int(10) NOT NULL AUTO_INCREMENT,
  `EventName` varchar(255) NOT NULL,
  `EventImage` varchar(255) DEFAULT NULL,
  `EventDate` date NOT NULL,
  `Location` varchar(255) NOT NULL,
  `Description` text,
  `TicketPrice` decimal(8,2) DEFAULT '0.00',
  `CurrentAttendees` int(10) DEFAULT '0',
  `GoalAttendees` int(10) NOT NULL,
  `CurrentStatus` tinyint(1) DEFAULT '1',
  `CategoryID` int(10) DEFAULT NULL,
  `OrganizerID` int(10) DEFAULT NULL,
  PRIMARY KEY (`EventID`),
  KEY `CategoryID` (`CategoryID`),
  KEY `OrganizerID` (`OrganizerID`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`CategoryID`) REFERENCES `categories` (`CategoryID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`OrganizerID`) REFERENCES `users` (`UserID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of events
-- ----------------------------
INSERT INTO `events` VALUES ('1', 'Hope Charity Gala 2025', '/images/gala.jpg', '2025-11-15', 'Sydney Convention Centre', 'Elegant evening supporting children education in rural communities.', '150.00', '45', '200', '1', '1', '2');
INSERT INTO `events` VALUES ('2', 'Sunrise Fun Run 2025', '/images/funrun.jpg', '2025-10-20', 'Centennial Park', '5km fun run raising funds for cancer research and patient support.', '25.00', '120', '300', '1', '2', '3');
INSERT INTO `events` VALUES ('3', 'Art for Hope Exhibition', '/images/art.jpg', '2025-12-05', 'Brisbane Art Gallery', 'Local artists showcase work to support mental health initiatives.', '0.00', '80', '150', '1', '7', '2');
INSERT INTO `events` VALUES ('4', 'Symphony of Hope Concert', '/images/concert.jpg', '2025-12-20', 'Melbourne Concert Hall', 'Classical music evening funding medical research for rare diseases.', '75.00', '150', '250', '1', '4', '3');
INSERT INTO `events` VALUES ('5', 'Online Silent Auction', '/images/auction.jpg', '2025-11-25', 'Virtual Event', 'Bid on exclusive items supporting animal rescue organizations.', '0.00', '95', '200', '1', '3', '2');
INSERT INTO `events` VALUES ('6', 'Tech Skills Workshop', '/images/workshop.jpg', '2025-10-15', 'Sydney Tech Hub', 'Learn digital skills supporting tech education for youth.', '20.00', '30', '80', '1', '5', '2');
INSERT INTO `events` VALUES ('7', 'Charity Tennis Open', '/images/sports.jpg', '2025-10-10', 'Perth Tennis Club', 'Amateur tournament supporting youth sports programs.', '30.00', '60', '100', '1', '6', '3');
INSERT INTO `events` VALUES ('8', 'Taste of Hope Festival', '/images/food.jpg', '2025-11-30', 'Adelaide Showground', 'Gourmet food event supporting food security programs.', '45.00', '200', '400', '1', '8', '3');

-- ----------------------------
-- Table structure for events_users
-- ----------------------------
DROP TABLE IF EXISTS `events_users`;
CREATE TABLE `events_users` (
  `EventID` int(10) NOT NULL DEFAULT '0',
  `UserID` int(10) NOT NULL DEFAULT '0',
  `RegistrationDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`EventID`,`UserID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `events_users_ibfk_1` FOREIGN KEY (`EventID`) REFERENCES `events` (`EventID`) ON DELETE CASCADE,
  CONSTRAINT `events_users_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of events_users
-- ----------------------------
INSERT INTO `events_users` VALUES ('1', '4', '2025-10-04 15:35:44');
INSERT INTO `events_users` VALUES ('1', '5', '2025-10-04 15:35:44');
INSERT INTO `events_users` VALUES ('2', '4', '2025-10-04 15:35:44');
INSERT INTO `events_users` VALUES ('3', '5', '2025-10-04 15:35:44');
INSERT INTO `events_users` VALUES ('4', '4', '2025-10-04 15:35:44');
INSERT INTO `events_users` VALUES ('5', '5', '2025-10-04 15:35:44');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `UserID` int(10) NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` enum('user','organizer','admin') NOT NULL DEFAULT 'user',
  `CreatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('1', 'AdminUser', 'admin@hopecharity.org', 'hashed_password_123', 'admin', '2025-10-04 15:35:44');
INSERT INTO `users` VALUES ('2', 'EventManager1', 'manager1@hopecharity.org', 'hashed_password_456', 'organizer', '2025-10-04 15:35:44');
INSERT INTO `users` VALUES ('3', 'EventManager2', 'manager2@hopecharity.org', 'hashed_password_789', 'organizer', '2025-10-04 15:35:44');
INSERT INTO `users` VALUES ('4', 'JohnDoe', 'john.doe@email.com', 'hashed_password_abc', 'user', '2025-10-04 15:35:44');
INSERT INTO `users` VALUES ('5', 'JaneSmith', 'jane.smith@email.com', 'hashed_password_def', 'user', '2025-10-04 15:35:44');
