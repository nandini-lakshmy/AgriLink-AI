const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

interface RequestOptions
  extends RequestInit {
  token?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {

  const {
    token,
    headers,
    ...requestOptions
  } = options;

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...requestOptions,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),

        ...headers,
      },
    }
  );

  if (!response.ok) {

    let message =
      `API request failed: ${response.status}`;

    try {
      const error =
        await response.json();

      if (error?.message) {
        message = error.message;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}


/* =========================================================
   GET
========================================================= */

export function apiGet<T>(
  endpoint: string,
  token?: string
) {
  return apiRequest<T>(
    endpoint,
    {
      method: "GET",
      token,
    }
  );
}


/* =========================================================
   POST
========================================================= */

export function apiPost<T>(
  endpoint: string,
  body: unknown,
  token?: string
) {
  return apiRequest<T>(
    endpoint,
    {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }
  );
}


/* =========================================================
   PUT
========================================================= */

export function apiPut<T>(
  endpoint: string,
  body: unknown,
  token?: string
) {
  return apiRequest<T>(
    endpoint,
    {
      method: "PUT",
      token,
      body: JSON.stringify(body),
    }
  );
}


/* =========================================================
   DELETE
========================================================= */

export function apiDelete<T>(
  endpoint: string,
  token?: string
) {
  return apiRequest<T>(
    endpoint,
    {
      method: "DELETE",
      token,
    }
  );
}


/* =========================================================
   FILE UPLOAD
========================================================= */

export async function apiUpload<T>(
  endpoint: string,
  file: File,
  token?: string
): Promise<T> {

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "POST",

        headers: token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : undefined,

        body: formData,
      }
    );

  if (!response.ok) {
    throw new Error(
      `Upload failed: ${response.status}`
    );
  }

  return response.json();
}


/* =========================================================
   API STATUS
========================================================= */

export async function checkApiConnection() {

  try {

    const response =
      await fetch(
        `${API_BASE_URL}/health`
      );

    return response.ok;

  } catch {
    return false;
  }
}


export { API_BASE_URL };