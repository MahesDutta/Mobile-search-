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

    let searchQuery = type === "email"
      ? `email:${query}`
      : `phone:${query}`;

    const res = await fetch(
      `https://api.dehashed.com/v2/search?query=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`
        }
      }
    );

    const data = await res.json();

    // 🔍 Debug (remove later if needed)
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
      message: "Something went wrong"
    };
  }
}
