-- =========================================================
-- DIGITAL GARDEN
-- Initial PostgreSQL schema for Supabase
-- =========================================================

begin;


-- =========================================================
-- 1. TABLE: PROFILES
-- Public information associated with Supabase Auth users.
-- =========================================================

create table if not exists public.profiles (
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    display_name text not null
        default 'Usuario'
        constraint profiles_display_name_not_blank
        check (
            char_length(trim(display_name)) between 1 and 80
        ),

    role text not null
        default 'user'
        constraint profiles_role_valid
        check (
            role in ('admin', 'user')
        ),

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now()
);


-- =========================================================
-- 2. TABLE: GARDENS
-- One personal garden per user.
-- =========================================================

create table if not exists public.gardens (
    id uuid primary key
        default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    name text not null
        default 'Mi jardín digital'
        constraint gardens_name_not_blank
        check (
            char_length(trim(name)) between 1 and 100
        ),

    description text
        constraint gardens_description_length
        check (
            description is null
            or char_length(description) <= 500
        ),

    is_public boolean not null
        default false,

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now(),

    constraint gardens_one_per_user
        unique (user_id)
);


-- =========================================================
-- 3. TABLE: NOTES
-- Ideas with seed, budding or tree maturity.
-- =========================================================

create table if not exists public.notes (
    id uuid primary key
        default gen_random_uuid(),

    garden_id uuid not null
        references public.gardens(id)
        on delete cascade,

    title text not null
        constraint notes_title_not_blank
        check (
            char_length(trim(title)) between 1 and 200
        ),

    content text not null
        default '',

    maturity text not null
        default 'seed'
        constraint notes_maturity_valid
        check (
            maturity in ('seed', 'budding', 'tree')
        ),

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now(),

    constraint notes_garden_and_id_unique
        unique (garden_id, id)
);


-- =========================================================
-- 4. TABLE: NOTE_RELATIONS
-- Directed links between notes from the same garden.
-- =========================================================

create table if not exists public.note_relations (
    id uuid primary key
        default gen_random_uuid(),

    garden_id uuid not null
        references public.gardens(id)
        on delete cascade,

    source_note_id uuid not null,

    target_note_id uuid not null,

    created_at timestamptz not null
        default now(),

    constraint note_relations_different_notes
        check (
            source_note_id <> target_note_id
        ),

    constraint note_relations_source_target_unique
        unique (
            source_note_id,
            target_note_id
        ),

    constraint note_relations_source_same_garden
        foreign key (
            garden_id,
            source_note_id
        )
        references public.notes (
            garden_id,
            id
        )
        on delete cascade,

    constraint note_relations_target_same_garden
        foreign key (
            garden_id,
            target_note_id
        )
        references public.notes (
            garden_id,
            id
        )
        on delete cascade
);


-- =========================================================
-- 5. TABLE: GALLERY_IMAGES
-- Metadata for files stored later in Supabase Storage.
-- =========================================================

create table if not exists public.gallery_images (
    id uuid primary key
        default gen_random_uuid(),

    garden_id uuid not null
        references public.gardens(id)
        on delete cascade,

    storage_path text not null
        constraint gallery_images_storage_path_not_blank
        check (
            char_length(trim(storage_path)) between 1 and 500
        ),

    description text
        constraint gallery_images_description_length
        check (
            description is null
            or char_length(description) <= 1000
        ),

    note_id uuid
        references public.notes(id)
        on delete set null,

    created_at timestamptz not null
        default now(),

    updated_at timestamptz not null
        default now(),

    constraint gallery_images_storage_path_unique
        unique (storage_path)
);


-- =========================================================
-- 6. INDEXES
-- =========================================================

create index if not exists notes_garden_id_idx
on public.notes(garden_id);

create index if not exists note_relations_garden_id_idx
on public.note_relations(garden_id);

create index if not exists note_relations_target_note_id_idx
on public.note_relations(target_note_id);

create index if not exists gallery_images_garden_id_idx
on public.gallery_images(garden_id);

create index if not exists gallery_images_note_id_idx
on public.gallery_images(note_id);


-- =========================================================
-- 7. AUTOMATIC UPDATED_AT
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;


drop trigger if exists set_profiles_updated_at
on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();


drop trigger if exists set_gardens_updated_at
on public.gardens;

create trigger set_gardens_updated_at
before update on public.gardens
for each row
execute function public.set_updated_at();


drop trigger if exists set_notes_updated_at
on public.notes;

create trigger set_notes_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();


drop trigger if exists set_gallery_images_updated_at
on public.gallery_images;

create trigger set_gallery_images_updated_at
before update on public.gallery_images
for each row
execute function public.set_updated_at();


-- =========================================================
-- 8. AUTOMATIC PROFILE CREATION
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (
        id,
        display_name
    )
    values (
        new.id,
        coalesce(
            nullif(
                trim(new.raw_user_meta_data ->> 'display_name'),
                ''
            ),
            'Usuario'
        )
    );

    return new;
end;
$$;


drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- =========================================================
-- 9. GALLERY IMAGE/NOTE VALIDATION
-- =========================================================

create or replace function public.validate_gallery_image_note_garden()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if new.note_id is not null
       and not exists (
           select 1
           from public.notes
           where public.notes.id = new.note_id
             and public.notes.garden_id = new.garden_id
       )
    then
        raise exception
            'The selected note must belong to the same garden as the image'
            using
                errcode = '23514',
                constraint = 'gallery_images_note_same_garden';
    end if;

    return new;
end;
$$;


drop trigger if exists validate_gallery_image_note_garden
on public.gallery_images;

create trigger validate_gallery_image_note_garden
before insert or update of garden_id, note_id
on public.gallery_images
for each row
execute function public.validate_gallery_image_note_garden();


-- =========================================================
-- 10. AUTHORIZATION HELPERS
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles
        where public.profiles.id = (select auth.uid())
          and public.profiles.role = 'admin'
    );
$$;


create or replace function public.can_manage_garden(
    requested_garden_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select
        exists (
            select 1
            from public.gardens
            where public.gardens.id = requested_garden_id
              and public.gardens.user_id = (select auth.uid())
        )
        or public.is_admin();
$$;


create or replace function public.can_read_garden(
    requested_garden_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select
        exists (
            select 1
            from public.gardens
            where public.gardens.id = requested_garden_id
              and (
                  public.gardens.user_id = (select auth.uid())
                  or public.gardens.is_public = true
              )
        )
        or public.is_admin();
$$;


revoke all
on function public.is_admin()
from public;

revoke all
on function public.can_manage_garden(uuid)
from public;

revoke all
on function public.can_read_garden(uuid)
from public;


grant execute
on function public.is_admin()
to authenticated, service_role;

grant execute
on function public.can_manage_garden(uuid)
to authenticated, service_role;

grant execute
on function public.can_read_garden(uuid)
to anon, authenticated, service_role;


-- =========================================================
-- 11. TABLE PERMISSIONS
-- =========================================================

revoke all privileges
on table
    public.profiles,
    public.gardens,
    public.notes,
    public.note_relations,
    public.gallery_images
from anon, authenticated;


grant select (id, display_name)
on public.profiles
to anon;

grant select
on public.gardens,
   public.notes,
   public.note_relations,
   public.gallery_images
to anon;


grant select
on public.profiles
to authenticated;

grant update (display_name)
on public.profiles
to authenticated;

grant select, insert, update, delete
on public.gardens,
   public.notes,
   public.gallery_images
to authenticated;

grant select, insert, delete
on public.note_relations
to authenticated;


grant all privileges
on table
    public.profiles,
    public.gardens,
    public.notes,
    public.note_relations,
    public.gallery_images
to service_role;


-- =========================================================
-- 12. ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles enable row level security;
alter table public.gardens enable row level security;
alter table public.notes enable row level security;
alter table public.note_relations enable row level security;
alter table public.gallery_images enable row level security;


-- =========================================================
-- 13. PROFILE POLICIES
-- =========================================================

drop policy if exists profiles_select_own_or_public
on public.profiles;

drop policy if exists profiles_select_admin
on public.profiles;

drop policy if exists profiles_update_own
on public.profiles;


create policy profiles_select_own_or_public
on public.profiles
for select
to anon, authenticated
using (
    id = (select auth.uid())
    or exists (
        select 1
        from public.gardens
        where public.gardens.user_id = profiles.id
          and public.gardens.is_public = true
    )
);


create policy profiles_select_admin
on public.profiles
for select
to authenticated
using (
    public.is_admin()
);


create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
    id = (select auth.uid())
)
with check (
    id = (select auth.uid())
);


-- =========================================================
-- 14. GARDEN POLICIES
-- =========================================================

drop policy if exists gardens_select_visible
on public.gardens;

drop policy if exists gardens_insert_own
on public.gardens;

drop policy if exists gardens_update_own
on public.gardens;

drop policy if exists gardens_delete_own
on public.gardens;


create policy gardens_select_visible
on public.gardens
for select
to anon, authenticated
using (
    public.can_read_garden(id)
);


create policy gardens_insert_own
on public.gardens
for insert
to authenticated
with check (
    user_id = (select auth.uid())
    or public.is_admin()
);


create policy gardens_update_own
on public.gardens
for update
to authenticated
using (
    public.can_manage_garden(id)
)
with check (
    user_id = (select auth.uid())
    or public.is_admin()
);


create policy gardens_delete_own
on public.gardens
for delete
to authenticated
using (
    public.can_manage_garden(id)
);


-- =========================================================
-- 15. NOTE POLICIES
-- =========================================================

drop policy if exists notes_select_visible
on public.notes;

drop policy if exists notes_insert_own
on public.notes;

drop policy if exists notes_update_own
on public.notes;

drop policy if exists notes_delete_own
on public.notes;


create policy notes_select_visible
on public.notes
for select
to anon, authenticated
using (
    public.can_read_garden(garden_id)
);


create policy notes_insert_own
on public.notes
for insert
to authenticated
with check (
    public.can_manage_garden(garden_id)
);


create policy notes_update_own
on public.notes
for update
to authenticated
using (
    public.can_manage_garden(garden_id)
)
with check (
    public.can_manage_garden(garden_id)
);


create policy notes_delete_own
on public.notes
for delete
to authenticated
using (
    public.can_manage_garden(garden_id)
);


-- =========================================================
-- 16. NOTE RELATION POLICIES
-- =========================================================

drop policy if exists note_relations_select_visible
on public.note_relations;

drop policy if exists note_relations_insert_own
on public.note_relations;

drop policy if exists note_relations_delete_own
on public.note_relations;


create policy note_relations_select_visible
on public.note_relations
for select
to anon, authenticated
using (
    public.can_read_garden(garden_id)
);


create policy note_relations_insert_own
on public.note_relations
for insert
to authenticated
with check (
    public.can_manage_garden(garden_id)
);


create policy note_relations_delete_own
on public.note_relations
for delete
to authenticated
using (
    public.can_manage_garden(garden_id)
);


-- =========================================================
-- 17. GALLERY IMAGE POLICIES
-- =========================================================

drop policy if exists gallery_images_select_visible
on public.gallery_images;

drop policy if exists gallery_images_insert_own
on public.gallery_images;

drop policy if exists gallery_images_update_own
on public.gallery_images;

drop policy if exists gallery_images_delete_own
on public.gallery_images;


create policy gallery_images_select_visible
on public.gallery_images
for select
to anon, authenticated
using (
    public.can_read_garden(garden_id)
);


create policy gallery_images_insert_own
on public.gallery_images
for insert
to authenticated
with check (
    public.can_manage_garden(garden_id)
);


create policy gallery_images_update_own
on public.gallery_images
for update
to authenticated
using (
    public.can_manage_garden(garden_id)
)
with check (
    public.can_manage_garden(garden_id)
);


create policy gallery_images_delete_own
on public.gallery_images
for delete
to authenticated
using (
    public.can_manage_garden(garden_id)
);


commit;
