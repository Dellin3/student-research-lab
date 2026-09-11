begin;

create table public.research_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  doc jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  constraint research_progress_doc_valid check ((
    jsonb_typeof(doc) = 'object'
    and doc ?& array['question', 'progress', 'sources', 'nextStep']
    and (doc - array['question', 'progress', 'sources', 'nextStep']) = '{}'::jsonb
    and jsonb_typeof(doc -> 'question') = 'string'
    and jsonb_typeof(doc -> 'progress') = 'string'
    and jsonb_typeof(doc -> 'sources') = 'string'
    and jsonb_typeof(doc -> 'nextStep') = 'string'
    and char_length(doc ->> 'question') <= 2000
    and char_length(doc ->> 'progress') <= 20000
    and char_length(doc ->> 'sources') <= 12000
    and char_length(doc ->> 'nextStep') <= 4000
    and octet_length(doc::text) <= 262144
  ) is true)
);

alter table public.research_progress enable row level security;
revoke all on table public.research_progress from public, anon, authenticated;
grant select on table public.research_progress to authenticated;

create policy research_progress_read_own on public.research_progress
for select to authenticated using ((select auth.uid()) = user_id);

create function public.stamp_research_progress()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.revision := 1;
  else
    if new.user_id is distinct from old.user_id then
      raise sqlstate '22023' using message = 'Record ownership cannot change';
    end if;
    new.revision := old.revision + 1;
  end if;
  new.updated_at := pg_catalog.clock_timestamp();
  return new;
end;
$$;
revoke all on function public.stamp_research_progress() from public, anon, authenticated;
create trigger research_progress_stamp before insert or update on public.research_progress
for each row execute function public.stamp_research_progress();

-- Reads use RLS; writes have exactly one entry point with server-derived ownership.
-- Direct REST writes are intentionally not granted to authenticated users.
create function public.save_research_progress(p_doc jsonb, p_expected_revision bigint)
returns public.research_progress language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_saved public.research_progress;
begin
  if v_user_id is null then
    raise sqlstate '42501' using message = 'Sign in to save research';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise sqlstate '22023' using message = 'Invalid expected revision';
  end if;
  if p_doc is null then
    raise sqlstate '22023' using message = 'Research document is required';
  end if;
  if p_expected_revision = 0 then
    insert into public.research_progress (user_id, doc) values (v_user_id, p_doc)
    on conflict (user_id) do nothing returning * into v_saved;
  else
    update public.research_progress as r set doc = p_doc
    where r.user_id = v_user_id and r.revision = p_expected_revision
    returning r.* into v_saved;
  end if;
  if not found then
    raise sqlstate 'PT409' using message = 'research_revision_conflict';
  end if;
  return v_saved;
end;
$$;
revoke all on function public.save_research_progress(jsonb, bigint) from public, anon, authenticated;
grant execute on function public.save_research_progress(jsonb, bigint) to authenticated;

commit;
