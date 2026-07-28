-- Storage bucket + policies. Implements docs/architecture/data-model.md
-- §7. Uses the storage schema, which only exists on a real Supabase
-- project (local/hosted) — not testable against vanilla Postgres.

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- Path convention: {circle_id}/{stories|comments|time-capsules|consents}/...
-- storage.foldername(name) splits the object path into an array, so
-- (storage.foldername(name))[1] is the circle_id segment and [2] is the
-- content-type segment.

create policy "circle members read media"
on storage.objects for select
using (
  bucket_id = 'media'
  and is_circle_member((storage.foldername(name))[1]::uuid)
);

create policy "storyteller session writes story/media audio"
on storage.objects for insert
with check (
  bucket_id = 'media'
  and is_storyteller_session((storage.foldername(name))[1]::uuid)
  and (storage.foldername(name))[2] in ('stories', 'time-capsules')
);

create policy "members write voice comments"
on storage.objects for insert
with check (
  bucket_id = 'media'
  and is_circle_member((storage.foldername(name))[1]::uuid)
  and circle_role((storage.foldername(name))[1]::uuid) in ('organizer', 'member')
  and (storage.foldername(name))[2] = 'comments'
);

-- voice_consents path ({circle_id}/consents/...) is intentionally left
-- with no matching policy, same reasoning as the voice_consents table
-- itself — deny-by-default until v3.
