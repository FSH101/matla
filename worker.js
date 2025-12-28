export default {
  async fetch(request) {
    const u = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,OPTIONS",
          "access-control-allow-headers": "*",
          "access-control-max-age": "86400",
        }
      });
    }

    const target = u.searchParams.get("url");
    if (!target) return new Response("Missing ?url=", { status: 400 });

    const t = new URL(target);

    // Белый список — чтобы воркер не стал открытым прокси.
    const allowed = ["moblauncher.matrp.ru"];
    if (!allowed.includes(t.hostname)) return new Response("Blocked host", { status: 403 });

    const upstream = await fetch(target, {
      method: "GET",
      headers: {
        // Тут уже МОЖНО подменить User-Agent, если серверу важно "как с телефона"
        "user-agent": "Dalvik/2.1.0 (Linux; U; Android 9; RMX3551 Build/PQ3A.190705.003)"
      }
    });

    const headers = new Headers(upstream.headers);
    headers.set("access-control-allow-origin", "*");
    headers.set("access-control-allow-methods", "GET,OPTIONS");
    headers.set("access-control-allow-headers", "*");

    return new Response(upstream.body, { status: upstream.status, headers });
  }
}
