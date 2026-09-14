CREATE TABLE `friends` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`userId` bigint unsigned NOT NULL,
	`friendId` bigint unsigned NOT NULL,
	`trangThai` enum('cho','ban','chan') NOT NULL DEFAULT 'cho',
	`thanThiet` bigint NOT NULL DEFAULT 0,
	`chaoNgay` varchar(16) DEFAULT '',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `friends_id` PRIMARY KEY(`id`),
	CONSTRAINT `friends_cap` UNIQUE(`userId`,`friendId`)
);
--> statement-breakpoint
ALTER TABLE `friends` ADD CONSTRAINT `friends_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `friends` ADD CONSTRAINT `friends_friendId_users_id_fk` FOREIGN KEY (`friendId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;