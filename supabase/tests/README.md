# RLS verification

`rls_verification.sql` runs real INSERT/UPDATE/SELECT attempts as different
users and roles, and asserts on actual row counts / affected rows — not
just "did an exception get raised." That distinction matters: an RLS
policy that silently excludes a row from a `WHERE` match is a real,
error-free no-op, and a naive "no exception = pass" check will not catch
it (see the correction note at the top of `docs/architecture/data-model.md`
for a case this caught for real).

## Running against a real Supabase project (recommended)

```sh
supabase start                      # local Supabase stack (needs Docker)
supabase db reset                   # applies supabase/migrations/, then supabase/seed.sql
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2)" \
  -v ON_ERROR_STOP=1 -f supabase/tests/rls_verification.sql
```

Or against a linked/hosted project (careful — this runs against real data,
wrapped in a transaction that rolls back, but only run it against a
project you're comfortable poking):

```sh
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls_verification.sql
```

Either way, `auth.uid()` / `auth.role()` / `auth.jwt()` and the
`anon`/`authenticated`/`service_role` Postgres roles already exist — no
extra setup needed.

## Running without Docker (local vanilla Postgres)

If Docker isn't available (this is how the suite was actually verified
while writing task 03 — see the PR), `local_dev_auth_shim.sql` replicates
just enough of Supabase's auth surface — `auth.users`, `auth.uid()`/
`auth.role()`/`auth.jwt()` reading the same `request.jwt.claims` session
GUC that PostgREST sets per-request on a real project, and the
`anon`/`authenticated`/`service_role` roles with matching grants — for the
same test file to behave identically:

```sh
createdb evertold_test
psql evertold_test -v ON_ERROR_STOP=1 -f supabase/tests/local_dev_auth_shim.sql
psql evertold_test -v ON_ERROR_STOP=1 -f supabase/migrations/0001_core_tables.sql
psql evertold_test -v ON_ERROR_STOP=1 -f supabase/migrations/0002_helper_functions.sql
psql evertold_test -v ON_ERROR_STOP=1 -f supabase/migrations/0003_rls_policies.sql
# 0004_storage_buckets.sql needs the real `storage` schema — skip it here.
psql evertold_test -v ON_ERROR_STOP=1 -f supabase/seed.sql
psql evertold_test -v ON_ERROR_STOP=1 -f supabase/tests/rls_verification.sql
dropdb evertold_test
```

`local_dev_auth_shim.sql` is explicitly **not** a migration — never run it
against a real Supabase project, and never add it to
`supabase/migrations/`.

## Expected output

18 `NOTICE: PASS: ...` lines, exit code 0. Any `ERROR: FAIL: ...` means a
policy doesn't do what `docs/architecture/data-model.md` says it should —
fix the doc first if the *intent* was wrong, fix the migration if the
*implementation* doesn't match a still-correct intent.
