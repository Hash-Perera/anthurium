type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
};

enum Service {
  WEATHER = "WEATHER",
  SOIL = "SOIL",
  DISEASE = "DISEASE",
  MARKET = "MARKET",
  ROOT = "ROOT",
}

const getBaseUrl = (service: Service): string => {
  const baseUrls: Record<Service, string> = {
    [Service.WEATHER]: process.env.EXPO_PUBLIC_API_BASE_URL_WEATHER ?? "",
    [Service.SOIL]: process.env.EXPO_PUBLIC_API_BASE_URL_SOIL ?? "",
    [Service.DISEASE]: process.env.EXPO_PUBLIC_API_BASE_URL_DISEASE ?? "",
    [Service.MARKET]: process.env.EXPO_PUBLIC_API_BASE_URL_MARKET ?? "",
    [Service.ROOT]: process.env.EXPO_PUBLIC_API_BASE_URL_ROOT ?? "",
  };

  const baseUrl = baseUrls[service];
  if (!baseUrl) {
    throw new Error(`Missing EXPO_PUBLIC_API_BASE_URL_${service} in .env`);
  }

  return baseUrl;
};

const joinUrl = (service: Service, path: string) => {
  const baseUrl = getBaseUrl(service);
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedPath}`;
};

const parseJsonSafely = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const apiRequest = async <T>(
  service: Service,
  path: string,
  options: RequestOptions = {},
) => {
  const url = joinUrl(service, path);
  console.log(`[API] ${service} - ${url}`);
  const method = options.method ?? (options.body ? "POST" : "GET");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const init: RequestInit = {
    method,
    headers,
    signal: options.signal,
  };

  if (options.body !== undefined) {
    init.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  const response = await fetch(url, init);
  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload && typeof payload === "object" && "message" in payload
          ? String(payload.message)
          : `Request failed with ${response.status}`;
    const error = new Error(message);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return payload as T;
};

export const get = <T>(
  service: Service,
  path: string,
  options?: Omit<RequestOptions, "method" | "body">,
) => apiRequest<T>(service, path, { ...options, method: "GET" });

export const post = <T>(
  service: Service,
  path: string,
  body?: unknown,
  options?: Omit<RequestOptions, "method">,
) => apiRequest<T>(service, path, { ...options, method: "POST", body });

export { Service };

