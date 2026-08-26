// دالة Cloudflare Pages Function — التحقق من كود المالك من جهة الخادم
// كلمة المرور محفوظة في المتغير البيئي ADMIN_PASSWORD بموقع Cloudflare فقط
// ولا توجد في أي ملف من ملفات الموقع، فتبقى سرية تماماً عن الزوار.

export async function onRequest(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false }), { status: 405, headers });
  }

  const stored = context.env.ADMIN_PASSWORD || '';
  if (!stored) {
    return new Response(JSON.stringify({ ok: false, message: 'not configured' }), {
      status: 500,
      headers
    });
  }

  try {
    const body = await context.request.json();
    const submitted = body && typeof body.code === 'string' ? body.code : '';
    const ok = submitted === stored;
    const res = new Response(JSON.stringify({ ok }), {
      status: ok ? 200 : 401,
      headers
    });
    return res;
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 400, headers });
  }
}