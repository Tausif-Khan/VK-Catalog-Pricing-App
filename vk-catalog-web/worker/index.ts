export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  /** Shared admin password. Unset = editing is open (local development). */
  ADMIN_PASSWORD?: string;
}

const ID_PATTERN = /^[a-z0-9-]+#[a-z0-9-]+$/;
const MAX_PRICE = 1_000_000_000;
const UNIT_MAX = 16;

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS prices (
  variant_id TEXT PRIMARY KEY,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);`;

const UPSERT_PRICE = `INSERT INTO prices (variant_id, value, unit) VALUES (?1, ?2, ?3)
  ON CONFLICT(variant_id) DO UPDATE SET
    value = excluded.value,
    unit = excluded.unit,
    updated_at = datetime('now')`;

// Session tokens for the admin password. In-memory per isolate: a restart
// signs everyone out, which is the safe default for a small team tool.
const sessions = new Set<string>();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

const isAuthorized = (request: Request, env: Env): boolean =>
  !env.ADMIN_PASSWORD || sessions.has(request.headers.get('x-admin-token') ?? '');

function validatePrice(body: unknown): { id: string; value: number; unit: string } | null {
  if (typeof body !== 'object' || body === null) return null;
  const { id, value, unit } = body as Record<string, unknown>;
  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > MAX_PRICE)
    return null;
  if (typeof unit !== 'string' || unit.trim().length === 0 || unit.length > UNIT_MAX) return null;
  return { id, value, unit: unit.trim() };
}

async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/prices' && method === 'GET') {
    await env.DB.prepare(CREATE_TABLE).run();
    const rows = await env.DB.prepare(
      'SELECT variant_id, value, unit FROM prices ORDER BY variant_id',
    ).all<{ variant_id: string; value: number; unit: string }>();
    const prices: Record<string, { value: number; unit: string }> = {};
    for (const row of rows.results ?? []) {
      prices[row.variant_id] = { value: row.value, unit: row.unit };
    }
    return json({ prices });
  }

  if (path === '/api/admin/status' && method === 'GET') {
    return json({ authRequired: Boolean(env.ADMIN_PASSWORD) });
  }

  if (path === '/api/admin/login' && method === 'POST') {
    if (!env.ADMIN_PASSWORD) return json({ ok: true });
    const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
    if (typeof body?.password !== 'string' || body.password !== env.ADMIN_PASSWORD) {
      return json({ ok: false, error: 'Wrong password' }, 401);
    }
    const token = randomToken();
    sessions.add(token);
    return json({ ok: true, token });
  }

  if (path === '/api/prices' && method === 'PUT') {
    if (!isAuthorized(request, env)) return json({ ok: false, error: 'Unauthorized' }, 401);
    const price = validatePrice(await request.json().catch(() => null));
    if (!price) return json({ ok: false, error: 'Invalid price data' }, 400);
    await env.DB.prepare(CREATE_TABLE).run();
    await env.DB.prepare(UPSERT_PRICE).bind(price.id, price.value, price.unit).run();
    return json({ ok: true });
  }

  if (method === 'DELETE' && path.startsWith('/api/prices/')) {
    if (!isAuthorized(request, env)) return json({ ok: false, error: 'Unauthorized' }, 401);
    const id = decodeURIComponent(path.slice('/api/prices/'.length));
    if (!ID_PATTERN.test(id)) return json({ ok: false, error: 'Invalid id' }, 400);
    await env.DB.prepare(CREATE_TABLE).run();
    await env.DB.prepare('DELETE FROM prices WHERE variant_id = ?1').bind(id).run();
    return json({ ok: true });
  }

  return json({ ok: false, error: 'Not found' }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url);
      } catch (err) {
        console.error('api error', err);
        return json({ ok: false, error: 'Internal error' }, 500);
      }
    }
    // Static assets: built SPA, with the app's index.html as the fallback.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;