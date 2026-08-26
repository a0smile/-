export async function onRequest(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false }), { status: 405, headers });
  }

  const stored = request.env.ADMIN_PASSWORD || '';
  if (!stored) {
    return new Response(JSON.stringify({ ok: false, message: 'not configured' }), {
      status: 500,
      headers
    });
  }

  try {
    const body = await request.json();
    const submitted = body && typeof body.code === 'string' ? body.code : '';
    const ok = submitted === stored;
    return new Response(JSON.stringify({ ok }), {
      status: ok ? 200 : 401,
      headers
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers });
  }
}