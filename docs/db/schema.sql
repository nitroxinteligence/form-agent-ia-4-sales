-- Enable required extension
create extension if not exists pgcrypto;

-- Main table
create table if not exists public.agent_forms (
  id uuid primary key default gen_random_uuid(),
  form_id text unique not null,
  status text not null default 'draft',
  current_step integer default 1,
  step_timestamps jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  full_name text,
  email text,
  agent_role text,
  agent_role_other text,
  terms_accepted boolean not null default false,
  terms_accepted_at timestamptz,
  agent_name text,
  agent_description text,
  agent_rules text,
  agent_tone text,
  agent_behaviors text,
  agent_focus text,
  agent_goal text,
  agent_unknown_questions text,
  product_name text,
  product_description text,
  product_features text,
  product_differentials text,
  product_audience text,
  should_sell boolean not null default false,
  sales_process text,
  sales_objections text,
  sales_objections_handling text,
  sales_goals text,
  sales_channels text,
  success_cases text,
  scripts text,
  knowledge_base_files jsonb not null default '[]'::jsonb,
  external_systems jsonb not null default '[]'::jsonb,
  external_features jsonb not null default '[]'::jsonb,
  scheduling_tool text,
  scheduling_availability text,
  scheduling_required_info text,
  operations_per_stage text,
  follow_up_rules text,
  reminders_rules text,
  response_time text,
  important_links jsonb not null default '[]'::jsonb,
  extra_info text
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_agent_forms_updated_at
before update on public.agent_forms
for each row execute function public.set_updated_at();

-- RLS policies
alter table public.agent_forms enable row level security;

create policy "public_insert_agent_forms"
  on public.agent_forms
  for insert
  to anon
  with check (true);

create policy "public_select_agent_forms_denied"
  on public.agent_forms
  for select
  to anon
  using (false);

create policy "public_update_agent_forms_denied"
  on public.agent_forms
  for update
  to anon
  using (false);

-- Storage bucket for knowledge base files
insert into storage.buckets (id, name, public)
values ('agent-knowledge', 'agent-knowledge', false)
on conflict do nothing;

-- Storage policies (anon can upload, but cannot read)
create policy "public_insert_agent_knowledge"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'agent-knowledge');

create policy "public_select_agent_knowledge_denied"
  on storage.objects
  for select
  to anon
  using (false);

create policy "public_delete_agent_knowledge"
  on storage.objects
  for delete
  to anon
  using (bucket_id = 'agent-knowledge');
