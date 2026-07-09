-- Custom SQL migration file, put your code below! --
INSERT INTO "bosses" ("id", "hp", "current_hp") VALUES
('boss_1', 100000000, 100000000),
('boss_2', 100000000, 100000000)
ON CONFLICT ("id") DO NOTHING;