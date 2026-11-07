
import { getStore } from "@netlify/blobs";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

const defaults = {
  whatsapp: "",
  youtube: "",
  archivoNuevo: "",
  archivosVip: "",
  freeFire: ""
};

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", { status: 204, headers });
  }

  const store = getStore("jtv-settings");

  if (req.method === "GET") {
    const saved = await store.get("links", { type: "json" });

    return new Response(
      JSON.stringify({ ...defaults, ...(saved || {}) }),
      { headers }
    );
  }

  if (req.method === "POST") {
    // Leer la contraseña desde las variables de Netlify
    const password = process.env.ADMIN_PASSWORD;

    const auth = req.headers.get("authorization") || "";

    if (!password || auth !== `Bearer ${password}`) {
      return new Response(
        JSON.stringify({ error: "Contraseña incorrecta" }),
        { status: 401, headers }
      );
    }

    let data;

    try {
      data = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Datos inválidos" }),
        { status: 400, headers }
      );
    }

    const clean = {};

    for (const key of Object.keys(defaults)) {
      clean[key] =
        typeof data[key] === "string"
          ? data[key].trim()
          : "";
    }

    await store.setJSON("links", clean);

    return new Response(
      JSON.stringify({ ok: true }),
      { headers }
    );
  }

  return new Response(
    JSON.stringify({ error: "Método no permitido" }),
    { status: 405, headers }
  );
};
