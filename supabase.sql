-- SQL for user_game_results
create extension if not exists "uuid-ossp";
create table if not exists user_game_results ( id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users(id) on delete cascade, win_count int default 0, lose_count int default 0, image_url text, updated_at timestamptz default now() );
