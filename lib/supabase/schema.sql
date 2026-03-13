-- BrincaMente Database Schema
-- Run this in Supabase SQL Editor

-- Users table (extends auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'parent' check (role in ('parent','admin')),
  created_at timestamptz default now()
);
alter table public.users enable row level security;
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Child profiles
create table public.child_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  age integer not null check (age between 3 and 12),
  avatar text default 'bear',
  level integer default 1,
  xp integer default 0,
  stars integer default 0,
  coins integer default 0,
  streak_days integer default 0,
  created_at timestamptz default now()
);
alter table public.child_profiles enable row level security;
create policy "Parents can manage own child profiles" on public.child_profiles for all using (user_id = auth.uid());

-- Game categories
create table public.game_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  min_age integer default 3,
  max_age integer default 12,
  icon text default 'gamepad-2',
  color text default '#3B82F6',
  is_active boolean default true
);
insert into public.game_categories (name, slug, description, icon, color) values
  ('Memória',    'memoria',   'Jogos de memória e concentração',  'brain',      '#A855F7'),
  ('Quiz',       'quiz',      'Perguntas e respostas educativas',  'help-circle','#3B82F6'),
  ('Associação', 'associacao','Arrastar e soltar, combinar pares', 'link',       '#22C55E'),
  ('Sequência',  'sequencia', 'Padrões e lógica',                 'list-ordered','#F97316');

-- Games
create table public.games (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.game_categories(id),
  name text not null,
  slug text unique not null,
  type text not null check (type in ('memory','quiz','drag_drop','sequence')),
  difficulty integer default 1 check (difficulty between 1 and 5),
  min_age integer default 3,
  max_age integer default 12,
  is_active boolean default true,
  created_at timestamptz default now()
);
insert into public.games (category_id, name, slug, type, difficulty, min_age, max_age)
select id, 'Jogo da Memória Fácil', 'memoria-facil', 'memory', 1, 3, 12 from public.game_categories where slug='memoria';
insert into public.games (category_id, name, slug, type, difficulty, min_age, max_age)
select id, 'Quiz das Letras', 'quiz-letras', 'quiz', 1, 3, 8 from public.game_categories where slug='quiz';
insert into public.games (category_id, name, slug, type, difficulty, min_age, max_age)
select id, 'Associar Palavras', 'associar-palavras', 'drag_drop', 1, 5, 12 from public.game_categories where slug='associacao';
insert into public.games (category_id, name, slug, type, difficulty, min_age, max_age)
select id, 'Sequência de Números', 'sequencia-numeros', 'sequence', 1, 4, 12 from public.game_categories where slug='sequencia';

-- Game sessions
create table public.game_sessions (
  id uuid default gen_random_uuid() primary key,
  child_profile_id uuid references public.child_profiles(id) on delete cascade,
  game_id uuid references public.games(id),
  score integer default 0,
  correct_answers integer default 0,
  wrong_answers integer default 0,
  duration_seconds integer default 0,
  completed boolean default false,
  created_at timestamptz default now()
);
alter table public.game_sessions enable row level security;
create policy "Parents can view child sessions" on public.game_sessions for all
  using (child_profile_id in (select id from public.child_profiles where user_id = auth.uid()));

-- Quiz questions
create table public.quiz_questions (
  id uuid default gen_random_uuid() primary key,
  game_id uuid references public.games(id) on delete cascade,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('a','b','c','d')),
  explanation text,
  difficulty integer default 1,
  is_active boolean default true
);

-- Achievements
create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon text default 'trophy',
  reward_coins integer default 10,
  reward_xp integer default 50,
  is_active boolean default true
);
insert into public.achievements (name, slug, description, icon, reward_coins, reward_xp) values
  ('Primeira Vitória',   'primeira-vitoria',   'Completou o primeiro jogo!',         'trophy',  10, 50),
  ('Memória de Ouro',    'memoria-ouro',       'Acertou todos os pares na memória!',  'brain',   20, 100),
  ('Quiz Master',        'quiz-master',        'Respondeu 10 perguntas corretamente!','star',    30, 150),
  ('Sequência Incrível', 'sequencia-incrivel', 'Completou uma sequência difícil!',   'zap',     25, 125),
  ('7 Dias Seguidos',    'streak-7',           'Jogou 7 dias seguidos!',             'flame',   50, 200);

-- Child achievements
create table public.child_achievements (
  id uuid default gen_random_uuid() primary key,
  child_profile_id uuid references public.child_profiles(id) on delete cascade,
  achievement_id uuid references public.achievements(id),
  unlocked_at timestamptz default now(),
  unique(child_profile_id, achievement_id)
);
alter table public.child_achievements enable row level security;
create policy "Parents can view child achievements" on public.child_achievements for all
  using (child_profile_id in (select id from public.child_profiles where user_id = auth.uid()));

-- Daily missions
create table public.daily_missions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  target_type text not null,
  target_value integer default 1,
  reward_coins integer default 15,
  reward_xp integer default 75,
  is_active boolean default true
);
insert into public.daily_missions (title, description, target_type, target_value, reward_coins, reward_xp) values
  ('Jogar 3 jogos',       'Complete 3 jogos hoje!',        'games_played',    3, 15, 75),
  ('10 acertos',          'Acerte 10 perguntas!',          'correct_answers', 10, 20, 100),
  ('Jogar memória',       'Jogue o jogo da memória!',      'memory_played',   1, 10, 50),
  ('Responder quiz',      'Responda um quiz completo!',    'quiz_played',     1, 10, 50);

-- Child missions
create table public.child_missions (
  id uuid default gen_random_uuid() primary key,
  child_profile_id uuid references public.child_profiles(id) on delete cascade,
  mission_id uuid references public.daily_missions(id),
  progress integer default 0,
  completed boolean default false,
  completed_at timestamptz,
  date date default current_date,
  unique(child_profile_id, mission_id, date)
);
alter table public.child_missions enable row level security;
create policy "Parents can manage child missions" on public.child_missions for all
  using (child_profile_id in (select id from public.child_profiles where user_id = auth.uid()));

-- Parent settings
create table public.parent_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade unique,
  max_daily_minutes integer default 60,
  sound_enabled boolean default true,
  notifications_enabled boolean default true,
  created_at timestamptz default now()
);
alter table public.parent_settings enable row level security;
create policy "Users can manage own settings" on public.parent_settings for all using (user_id = auth.uid());

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'parent');
  insert into public.parent_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
