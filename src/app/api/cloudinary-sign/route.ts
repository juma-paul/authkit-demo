const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export async function POST(request: Request) {
  const body = await request.json();
  const cookies = request.headers.get("cookie") || "";

  console.log("[cloudinary-sign] paramsToSign:", body.paramsToSign);

  // First attempt
  let response = await fetch(`${API_URL}/users/cloudinary-sign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      Cookie: cookies,
    },
    body: JSON.stringify(body),
  });

  let setCookieHeader: string | null = null;

  // If token expired, refresh and retry
  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));

    if (errorData?.error?.code === "TOKEN_EXPIRED") {
      // Call refresh endpoint
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
          Cookie: cookies,
        },
      });

      if (refreshResponse.ok) {
        // Get new cookies from refresh response
        setCookieHeader = refreshResponse.headers.get("set-cookie");

        // Retry with new cookies
        response = await fetch(`${API_URL}/users/cloudinary-sign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
            Cookie: setCookieHeader || cookies,
          },
          body: JSON.stringify(body),
        });
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return Response.json(
      { error: error?.error?.message || "Failed to sign upload" },
      { status: response.status }
    );
  }

  const data = await response.json();

  // Forward new cookies to browser if we refreshed
  if (setCookieHeader) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setCookieHeader,
      },
    });
  }

  return Response.json(data);
}
