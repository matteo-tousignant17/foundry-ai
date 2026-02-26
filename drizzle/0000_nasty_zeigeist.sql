CREATE TABLE `objectives` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`timeframe` text,
	`metric` text,
	`weight` real DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `prd_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`prd_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`prd_id`) REFERENCES `prds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `prds` (
	`id` text PRIMARY KEY NOT NULL,
	`roadmap_item_id` text,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`summary` text,
	`problem_statement` text,
	`objectives` text,
	`user_stories` text,
	`design_asset_link` text,
	`open_questions` text,
	`acceptance_criteria` text,
	`evidence` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`roadmap_item_id`) REFERENCES `roadmap_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `problems` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`statement` text NOT NULL,
	`who_affected` text,
	`workflow_block` text,
	`business_impact` text,
	`retention_or_growth` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`frequency` text,
	`severity` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `releases` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`target_date` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `roadmap_item_objectives` (
	`id` text PRIMARY KEY NOT NULL,
	`roadmap_item_id` text NOT NULL,
	`objective_id` text NOT NULL,
	`impact_to_objective` integer,
	FOREIGN KEY (`roadmap_item_id`) REFERENCES `roadmap_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`objective_id`) REFERENCES `objectives`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roadmap_item_problems` (
	`id` text PRIMARY KEY NOT NULL,
	`roadmap_item_id` text NOT NULL,
	`problem_id` text NOT NULL,
	FOREIGN KEY (`roadmap_item_id`) REFERENCES `roadmap_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roadmap_items` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`rationale` text,
	`type` text DEFAULT 'feature' NOT NULL,
	`status` text DEFAULT 'proposed' NOT NULL,
	`target_month` text,
	`effort_size` text,
	`reach` integer,
	`impact` integer,
	`confidence` integer,
	`effort` integer,
	`score` real,
	`parent_id` text,
	`release_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`release_id`) REFERENCES `releases`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `signal_problems` (
	`id` text PRIMARY KEY NOT NULL,
	`signal_id` text NOT NULL,
	`problem_id` text NOT NULL,
	`quote` text,
	FOREIGN KEY (`signal_id`) REFERENCES `signals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`problem_id`) REFERENCES `problems`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `signals` (
	`id` text PRIMARY KEY NOT NULL,
	`raw_text` text NOT NULL,
	`source` text,
	`source_url` text,
	`customer` text,
	`arr` text,
	`severity` text,
	`frequency` text,
	`renewal_risk` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ticket_stubs` (
	`id` text PRIMARY KEY NOT NULL,
	`prd_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`acceptance_criteria` text,
	`story_points` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`prd_id`) REFERENCES `prds`(`id`) ON UPDATE no action ON DELETE cascade
);
