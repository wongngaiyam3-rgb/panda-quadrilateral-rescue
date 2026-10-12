CREATE TABLE `classrooms` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`class_name` text NOT NULL,
	`mode` text NOT NULL,
	`opened` integer DEFAULT 1 NOT NULL,
	`paused` integer DEFAULT 0 NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `classrooms_code_unique` ON `classrooms` (`code`);--> statement-breakpoint
CREATE TABLE `learners` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`label` text NOT NULL,
	`token_hash` text NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`last_seen` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `room_label` ON `learners` (`room_id`,`label`);--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`learner_id` text NOT NULL,
	`stage` integer NOT NULL,
	`draft` text DEFAULT '{}' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`passed` integer DEFAULT 0 NOT NULL,
	`feedback` text DEFAULT '' NOT NULL,
	`updated` integer NOT NULL,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learner_stage` ON `records` (`learner_id`,`stage`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
