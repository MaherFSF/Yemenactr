CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255),
	`description` text,
	`indicatorCode` varchar(100),
	`severity` varchar(20) NOT NULL DEFAULT 'info',
	`isRead` boolean NOT NULL DEFAULT false,
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduler_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobName` varchar(100) NOT NULL,
	`jobType` enum('data_refresh','signal_detection','publication','backup','cleanup') NOT NULL,
	`cronExpression` varchar(50) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT true,
	`lastRunAt` timestamp,
	`lastRunStatus` enum('success','failed','running','skipped'),
	`lastRunDuration` int,
	`lastRunError` text,
	`nextRunAt` timestamp,
	`runCount` int NOT NULL DEFAULT 0,
	`failCount` int NOT NULL DEFAULT 0,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scheduler_jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `scheduler_jobs_jobName_unique` UNIQUE(`jobName`)
);
--> statement-breakpoint
CREATE TABLE `scheduler_run_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobId` int NOT NULL,
	`jobName` varchar(100) NOT NULL,
	`status` enum('success','failed','running','skipped') NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`duration` int,
	`recordsProcessed` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`details` json,
	CONSTRAINT `scheduler_run_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_acknowledgedBy_users_id_fk` FOREIGN KEY (`acknowledgedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduler_run_history` ADD CONSTRAINT `scheduler_run_history_jobId_scheduler_jobs_id_fk` FOREIGN KEY (`jobId`) REFERENCES `scheduler_jobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `type_idx` ON `alerts` (`type`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `alerts` (`severity`);--> statement-breakpoint
CREATE INDEX `is_read_idx` ON `alerts` (`isRead`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `alerts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `job_name_idx` ON `scheduler_jobs` (`jobName`);--> statement-breakpoint
CREATE INDEX `job_type_idx` ON `scheduler_jobs` (`jobType`);--> statement-breakpoint
CREATE INDEX `next_run_at_idx` ON `scheduler_jobs` (`nextRunAt`);--> statement-breakpoint
CREATE INDEX `job_id_idx` ON `scheduler_run_history` (`jobId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `scheduler_run_history` (`status`);--> statement-breakpoint
CREATE INDEX `started_at_idx` ON `scheduler_run_history` (`startedAt`);