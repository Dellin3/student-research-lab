import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { emptyProgress } from '../src/utils/progressDocument.js'

// Execute the actual migration in PostgreSQL, with only Supabase's auth schema
// and roles supplied as fixtures. The RLS policies and RPC are not mocked.
const db = new PGlite()
const a = '11111111-1111-4111-8111-111111111111'
const b = '22222222-2222-4222-8222-222222222222'
await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema auth to authenticated, anon;
insert into auth.users values ('${a}'),('${b}');`)
await db.exec(readFileSync(new URL('../supabase/migrations/202609110001_research_progress.sql', import.meta.url), 'utf8'))
const identify = async id => { await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]); await db.exec('set role authenticated') }
const save = (doc, revision) => db.query('select * from public.save_research_progress($1::jsonb,$2::bigint)', [JSON.stringify(doc), revision])
const denied = async (query, params) => assert.rejects(db.query(query, params), error => error.code === '42501')
const first = { ...emptyProgress(), question: 'A private question', progress: 'first attempt' }
await identify(a)
let result = await save(first, 0)
assert.equal(result.rows[0].user_id, a); assert.equal(Number(result.rows[0].revision), 1)
await assert.rejects(save({ ...first, progress: 'duplicate initial' }, 0), error => error.code === 'PT409')
await identify(b)
assert.equal((await db.query('select * from public.research_progress')).rows.length, 0, 'B must not see A')
await save({ ...emptyProgress(), question: 'B private question' }, 0)
assert.equal((await db.query('select * from public.research_progress')).rows.length, 1)
await denied('update public.research_progress set doc=$1::jsonb', [JSON.stringify(first)])
await denied('insert into public.research_progress(user_id,doc) values ($1,$2::jsonb)', [a, JSON.stringify(first)])
await denied('delete from public.research_progress')
await identify(a)
result = await save({ ...first, progress: 'newer' }, 1)
assert.equal(Number(result.rows[0].revision), 2)
await assert.rejects(save({ ...first, progress: 'stale tab' }, 1), error => error.code === 'PT409')
assert.equal((await db.query('select doc from public.research_progress')).rows[0].doc.progress, 'newer')
for (const bad of [{}, { ...first, question: null }, { ...first, progress: ['array'] }, { ...first, question: 'a'.repeat(2001) }, { ...first, owner: b }]) {
  await assert.rejects(save(bad, 2), error => error.code === '23514')
}
await assert.rejects(save(first, -1), error => error.code === '22023')
result = await save(emptyProgress(), 2)
assert.equal(Number(result.rows[0].revision), 3, 'Clearing must retain a monotonically increasing revision')
await identify('')
await assert.rejects(save(first, 0), error => error.code === '42501')
await db.exec('reset role; set role anon;')
await denied('select * from public.research_progress')
await denied('select * from public.save_research_progress($1::jsonb,0)', [JSON.stringify(first)])
await db.close()
console.log('Database checks passed: real PostgreSQL RLS, user isolation, direct-write denial, insert/update conflicts, document limits, and signed-out denial.')
