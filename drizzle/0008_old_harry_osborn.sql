CREATE TABLE `connector_thresholds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectorCode` varchar(100) NOT NULL,
	`warningDays` int NOT NULL DEFAULT 7,
	`criticalDays` int NOT NULL DEFAULT 14,
	`enabled` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int,
	CONSTRAINT `connector_thresholds_id` PRIMARY KEY(`id`),
	CONSTRAINT `connector_thresholds_connectorCode_unique` UNIQUE(`connectorCode`)
);
--> statement-breakpoint
CREATE TABLE `email_notification_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recipientEmail` varchar(320) NOT NULL,
	`recipientName` varchar(255),
	`subject` varchar(500) NOT NULL,
	`htmlBody` text NOT NULL,
	`textBody` text,
	`priority` enum('low','normal','high','critical') NOT NULL DEFAULT 'normal',
	`status` enum('pending','sending','sent','failed') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`lastAttempt` timestamp,
	`sentAt` timestamp,
	`errorMessage` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_notification_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_delivery_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`payload` json NOT NULL,
	`responseStatus` int,
	`responseBody` text,
	`success` boolean NOT NULL,
	`errorMessage` text,
	`deliveredAt` timestamp NOT NULL DEFAULT (now()),
	`duration` int,
	CONSTRAINT `webhook_delivery_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_event_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('alerts','data','system','publications') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	CONSTRAINT `webhook_event_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhook_event_types_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('slack','discord','email','custom') NOT NULL,
	`url` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`events` json NOT NULL,
	`headers` json,
	`lastTriggered` timestamp,
	`failureCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdBy` int,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `connector_thresholds` ADD CONSTRAINT `connector_thresholds_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_delivery_logs` ADD CONSTRAINT `webhook_delivery_logs_webhookId_webhooks_id_fk` FOREIGN KEY (`webhookId`) REFERENCES `webhooks`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhooks` ADD CONSTRAINT `webhooks_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `status_idx` ON `email_notification_queue` (`status`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `email_notification_queue` (`priority`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `email_notification_queue` (`createdAt`);--> statement-breakpoint
CREATE INDEX `webhook_idx` ON `webhook_delivery_logs` (`webhookId`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `webhook_delivery_logs` (`eventType`);--> statement-breakpoint
CREATE INDEX `delivered_at_idx` ON `webhook_delivery_logs` (`deliveredAt`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `webhooks` (`type`);--> statement-breakpoint
CREATE INDEX `enabled_idx` ON `webhooks` (`enabled`);