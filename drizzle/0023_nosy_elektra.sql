CREATE TABLE `sector_agent_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectorCode` varchar(50) NOT NULL,
	`runType` enum('nightly','daily','weekly','manual') NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`outputFiles` json,
	`errorMessage` text,
	`metrics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sector_agent_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `agent_run_sector_idx` ON `sector_agent_runs` (`sectorCode`);--> statement-breakpoint
CREATE INDEX `agent_run_status_idx` ON `sector_agent_runs` (`status`);--> statement-breakpoint
CREATE INDEX `agent_run_started_idx` ON `sector_agent_runs` (`startedAt`);