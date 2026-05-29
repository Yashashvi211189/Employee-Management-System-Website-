export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.MY_SECRET_TOKEN) {
    return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
  }

  const path = searchParams.get('path') || '/';

  try {
    // Trigger Next.js to rebuild the page at `path`
    await res.revalidate(path);
    return new Response(JSON.stringify({ revalidated: true, path }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: "Error revalidating", error: err.message }), { status: 500 });
  }
}
