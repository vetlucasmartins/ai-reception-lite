create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tone_of_voice text not null default 'friendly and professional',
  timezone text not null default 'Europe/London',
  services jsonb not null default '[]'::jsonb,
  opening_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (business_id, profile_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  source text not null default 'website' check (source in ('website', 'whatsapp', 'instagram', 'email', 'phone', 'manual', 'demo')),
  requested_service text,
  temperature text not null default 'unclassified' check (temperature in ('hot', 'warm', 'cold', 'unclassified')),
  funnel_stage text not null default 'new' check (funnel_stage in ('new', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  summary text,
  status text not null default 'new' check (status in ('new', 'open', 'won', 'lost', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_contact_required check (email is not null or phone is not null)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound', 'internal')),
  channel text not null default 'website' check (channel in ('website', 'whatsapp', 'instagram', 'email', 'phone', 'manual')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_classifications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  provider text not null,
  model text not null,
  temperature text not null check (temperature in ('hot', 'warm', 'cold')),
  urgency text not null check (urgency in ('high', 'medium', 'low', 'unknown')),
  intent text,
  confidence numeric(4,3) not null default 0 check (confidence >= 0 and confidence <= 1),
  extracted_fields jsonb not null default '{}'::jsonb,
  suggested_next_action text not null check (
    suggested_next_action in (
      'call',
      'send_proposal',
      'ask_more_information',
      'schedule_meeting',
      'send_pricing',
      'nurture'
    )
  ),
  response_draft text,
  created_at timestamptz not null default now()
);

create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  action text not null check (
    action in (
      'call',
      'send_proposal',
      'ask_more_information',
      'schedule_meeting',
      'send_pricing',
      'nurture'
    )
  ),
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_members_profile_id_idx on public.business_members(profile_id);
create unique index if not exists business_members_profile_id_unique_idx on public.business_members(profile_id);
create index if not exists leads_business_id_created_at_idx on public.leads(business_id, created_at desc);
create index if not exists leads_business_id_temperature_idx on public.leads(business_id, temperature);
create index if not exists conversations_lead_id_created_at_idx on public.conversations(lead_id, created_at asc);
create index if not exists ai_classifications_lead_id_created_at_idx on public.ai_classifications(lead_id, created_at desc);
create index if not exists follow_up_tasks_lead_id_status_idx on public.follow_up_tasks(lead_id, status);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

drop trigger if exists follow_up_tasks_set_updated_at on public.follow_up_tasks;
create trigger follow_up_tasks_set_updated_at
before update on public.follow_up_tasks
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.leads enable row level security;
alter table public.conversations enable row level security;
alter table public.ai_classifications enable row level security;
alter table public.follow_up_tasks enable row level security;

create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members
    where business_id = target_business_id
      and profile_id = auth.uid()
  );
$$;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "businesses_select_member" on public.businesses;
create policy "businesses_select_member"
on public.businesses for select
using (public.is_business_member(id));

drop policy if exists "businesses_update_member" on public.businesses;
create policy "businesses_update_member"
on public.businesses for update
using (public.is_business_member(id))
with check (public.is_business_member(id));

drop policy if exists "business_members_select_member" on public.business_members;
create policy "business_members_select_member"
on public.business_members for select
using (public.is_business_member(business_id));

drop policy if exists "leads_select_member" on public.leads;
create policy "leads_select_member"
on public.leads for select
using (public.is_business_member(business_id));

drop policy if exists "leads_update_member" on public.leads;
create policy "leads_update_member"
on public.leads for update
using (public.is_business_member(business_id))
with check (public.is_business_member(business_id));

drop policy if exists "conversations_select_member" on public.conversations;
create policy "conversations_select_member"
on public.conversations for select
using (
  exists (
    select 1
    from public.leads
    where leads.id = conversations.lead_id
      and public.is_business_member(leads.business_id)
  )
);

drop policy if exists "ai_classifications_select_member" on public.ai_classifications;
create policy "ai_classifications_select_member"
on public.ai_classifications for select
using (
  exists (
    select 1
    from public.leads
    where leads.id = ai_classifications.lead_id
      and public.is_business_member(leads.business_id)
  )
);

drop policy if exists "follow_up_tasks_select_member" on public.follow_up_tasks;
create policy "follow_up_tasks_select_member"
on public.follow_up_tasks for select
using (
  exists (
    select 1
    from public.leads
    where leads.id = follow_up_tasks.lead_id
      and public.is_business_member(leads.business_id)
  )
);

drop policy if exists "follow_up_tasks_update_member" on public.follow_up_tasks;
create policy "follow_up_tasks_update_member"
on public.follow_up_tasks for update
using (
  exists (
    select 1
    from public.leads
    where leads.id = follow_up_tasks.lead_id
      and public.is_business_member(leads.business_id)
  )
)
with check (
  exists (
    select 1
    from public.leads
    where leads.id = follow_up_tasks.lead_id
      and public.is_business_member(leads.business_id)
  )
);
