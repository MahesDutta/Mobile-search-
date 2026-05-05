export interface ApiResult {
    status?: boolean | string;
    data?: any;
    message?: string;
    // Mobile specific
    mobile?: string;
    operator?: string;
    circle?: string;
    // Email specific
    email?: string;
    [key: string]: any;
}

export async function checkDataLeak(
  query: string,
  type: "mobile" | "email"
) {
  try {
    const auth = Buffer.from(
      `${process.env.DEHASHED_EMAIL}:${process.env.DEHASHED_KEY}`
    ).toString("base64");

    const searchQuery =
      type === "email" ? `email:${query}` : `phone:${query}`;

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);

    const res = await fetch(
      `https://api.dehashed.com/v2/search?query=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`
        },
        signal: controller.signal
      }
    );

    let data;
    try {
      data = await res.json();
    } catch {
      return {
        status: "error",
        message: "Invalid API response"
      };
    }

    console.log("DeHashed Response:", data);

    if (!res.ok) {
      return {
        status: "failed",
        message: data?.error || "API request failed"
      };
    }

    if (!data.entries || data.entries.length === 0) {
      return {
        status: "failed",
        message: "No results found"
      };
    }

    return data.entries.map((item: any) => ({
      status: "success",
      name: item.name || item.username || "Unknown",
      email: item.email || "",
      mobile: item.phone || "",
      address: item.address || "N/A",
      circle: item.source || "DeHashed",
      id: item.id || Math.random().toString()
    }));

  } catch (error) {
    console.error("DeHashed Error:", error);

    return {
      status: "error",
      message: "Request failed or timed out"
    };
  }
}
