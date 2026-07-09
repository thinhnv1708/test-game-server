CREATE TABLE "bosses" (
	"id" text PRIMARY KEY NOT NULL,
	"hp" bigint NOT NULL,
	"current_hp" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consumer_offset" (
	"id" text PRIMARY KEY NOT NULL,
	"last_event_sequence" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"player_id" text NOT NULL,
	"boss_id" text NOT NULL,
	"damage" bigint NOT NULL,
	CONSTRAINT "contributions_pk" PRIMARY KEY("player_id","boss_id")
);
--> statement-breakpoint
CREATE TABLE "reward_claims" (
	"player_id" text NOT NULL,
	"boss_id" text NOT NULL,
	"timestamp" bigint NOT NULL,
	CONSTRAINT "reward_claims_pk" PRIMARY KEY("player_id","boss_id")
);
--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_boss_id_bosses_id_fk" FOREIGN KEY ("boss_id") REFERENCES "public"."bosses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_claims" ADD CONSTRAINT "reward_claims_boss_id_bosses_id_fk" FOREIGN KEY ("boss_id") REFERENCES "public"."bosses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bosses_current_hp_idx" ON "bosses" USING btree ("current_hp") WHERE current_hp > 0;--> statement-breakpoint
CREATE INDEX "boss_id_damage_idx" ON "contributions" USING btree ("boss_id","damage" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "reward_claims_player_id_idx" ON "reward_claims" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "reward_claims_boss_id_idx" ON "reward_claims" USING btree ("boss_id");