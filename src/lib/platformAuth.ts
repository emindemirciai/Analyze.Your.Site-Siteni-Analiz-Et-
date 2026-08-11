type JsonObject = Record<string, unknown>;

export type PlatformAuthorizationResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

type SessionEndpoint = {
  path: string;
  authorizesByEndpoint: boolean;
};

const SESSION_ENDPOINTS: SessionEndpoint[] = [
  { path: "/api/admin/session", authorizesByEndpoint: true },
  { path: "/api/auth/me", authorizesByEndpoint: false },
];

const PRIVILEGED_ROLES = new Set([
  "ADMIN",
  "OWNER",
  "SUPER_ADMIN",
  "GAME_ADMIN",
  "CONTENT_EDITOR",
  "ANALYST",
  "SUPPORT",
  "MODERATOR",
]);

const preferredSessionEndpoints = new Map<string, SessionEndpoint>();

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJsonObject(response: Response): Promise<JsonObject> {
  const payload: unknown = await response.json().catch(() => ({}));
  return isJsonObject(payload) ? payload : {};
}

function nestedObjects(payload: JsonObject) {
  const data = isJsonObject(payload.data) ? payload.data : undefined;
  const user = isJsonObject(payload.user) ? payload.user : undefined;
  const dataUser = data && isJsonObject(data.user) ? data.user : undefined;
  return [payload, data, user, dataUser].filter((item): item is JsonObject => Boolean(item));
}

export function extractPlatformToken(payload: JsonObject) {
  for (const source of nestedObjects(payload)) {
    for (const key of ["token", "accessToken", "access_token"]) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return "";
}

export function getPlatformMessage(payload: JsonObject, fallback: string) {
  for (const source of nestedObjects(payload)) {
    if (typeof source.message === "string" && source.message.trim()) {
      return source.message.trim();
    }
    if (Array.isArray(source.message)) {
      const message = source.message.filter((item) => typeof item === "string").join(", ");
      if (message) return message;
    }
    if (typeof source.error === "string" && source.error.trim()) {
      return source.error.trim();
    }
  }

  return fallback;
}

function extractPlatformRole(payload: JsonObject) {
  for (const source of nestedObjects(payload)) {
    for (const key of ["role", "globalRole", "global_role"]) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return value.trim().toUpperCase();
    }
  }

  return "";
}

function endpointUrl(authApiUrl: string, path: string) {
  return `${authApiUrl.replace(/\/$/, "")}${path}`;
}

function orderedSessionEndpoints(authApiUrl: string) {
  const preferred = preferredSessionEndpoints.get(authApiUrl);
  if (!preferred) return SESSION_ENDPOINTS;
  return [preferred, ...SESSION_ENDPOINTS.filter((endpoint) => endpoint.path !== preferred.path)];
}

export async function validatePlatformAdmin(
  authApiUrl: string,
  token: string,
): Promise<PlatformAuthorizationResult> {
  for (const endpoint of orderedSessionEndpoints(authApiUrl)) {
    let response: Response;

    try {
      response = await fetch(endpointUrl(authApiUrl, endpoint.path), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      return {
        ok: false,
        status: 503,
        message: "Yetkilendirme sunucusuna ulaşılamadı.",
      };
    }

    const payload = await readJsonObject(response);
    if (response.status === 404 || response.status === 405) continue;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: getPlatformMessage(payload, "Yönetici oturumu doğrulanamadı."),
      };
    }

    const role = extractPlatformRole(payload);
    if (!endpoint.authorizesByEndpoint && !PRIVILEGED_ROLES.has(role)) {
      return {
        ok: false,
        status: 403,
        message: "Bu panel yalnızca yetkili platform yöneticilerine açıktır.",
      };
    }

    preferredSessionEndpoints.set(authApiUrl, endpoint);
    return { ok: true };
  }

  return {
    ok: false,
    status: 503,
    message: "Yetkilendirme API'sinde desteklenen bir yönetici oturumu endpointi bulunamadı.",
  };
}

export async function readPlatformResponse(response: Response) {
  return readJsonObject(response);
}
