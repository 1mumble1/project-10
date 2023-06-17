CREATE database blog;
USE blog;

CREATE TABLE user
(
   `user_id`      INT NOT NULL AUTO_INCREMENT,
   `email`        VARCHAR(255),
   `password`     VARCHAR(255),
   PRIMARY KEY (`user_id`)
) ENGINE = InnoDB
CHARACTER SET = utf8mb4
COLLATE utf8mb4_unicode_ci
;