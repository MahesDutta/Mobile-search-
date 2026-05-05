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

    let searchQuery = "";
    if (type === "email") {
      searchQuery = `email:${query}`;
    } else {
      searchQuery = `phone:${query}`;
    }

    const res = await fetch(
      `https://api.dehashed.com/v2/search?query=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Basic ${auth}`
        }
      }
    );

    if (!res.ok) {
      return {
        status: "failed",
        message: "No data found"
      };
    }

    const data = await res.json();

    if (!data.entries || data.entries.length === 0) {
      return {
        status: "failed",
        message: "No results"
      };
    }

    return data.entries.map((item: any) => ({
      status: "success",
      name: item.name || "Unknown",
      email: item.email,
      mobile: item.phone,
      address: item.address || "N/A",
      circle: item.source || "DeHashed",
      id: item.id
    }));

  } catch (error) {
    console.error(error);
    return {
      status: "error",
      message: "API error"
    };
  }
}
