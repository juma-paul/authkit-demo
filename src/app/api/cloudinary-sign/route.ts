const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export async function POST(request: Request) {
  const body = await request.json();
  const cookies = request.headers.get("cookie") || "";

  let response = await fetch(`${API_URL}/users/cloudinary-sign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      Cookie: cookies,
    },
    body: JSON.stringify(body),
  });

  let newCookies: string | null = null;

  // Access token expired or unauthorized → try refresh
  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));
    const errorCode = errorData?.error?.code;

    // Try refresh for both TOKEN_EXPIRED and UNAUTHORIZED
    // (UNAUTHORIZED happens when access token cookie is missing/deleted)
    if (errorCode === "TOKEN_EXPIRED" || errorCode === "UNAUTHORIZED") {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          Cookie: cookies,
        },
      });

      // Refresh token expired → session dead
      if (!refreshResponse.ok) {
        return Response.json(
          {
            error: "Session expired",
            redirect: "/login?reason=session_expired",
          },
          { status: 401 },
        );
      }

      // Get updated cookies
      newCookies = refreshResponse.headers.get("set-cookie");

      // Retry original request
      response = await fetch(`${API_URL}/users/cloudinary-sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          Cookie: newCookies || cookies,
        },
        body: JSON.stringify(body),
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    return Response.json(
      {
        error: error?.error?.message || "Failed to sign upload",
      },
      { status: response.status },
    );
  }

  const data = await response.json();

  // Forward refreshed cookies
  if (newCookies) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": newCookies,
      },
    });
  }

  return Response.json(data);
}
