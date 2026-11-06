export async function POST(_req: Request) {
  try {
    const searchTerm = new URL(_req.url).searchParams.get("q") ?? "";
    if (!searchTerm.trim().length) throw new Error("No Search Query");

    return Response.json({
      message: " OPk",
    });
  } catch (err) {
    console.log("SEARCH API ERROR: ", err);
  }
}
