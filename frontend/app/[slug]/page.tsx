// app/[slug]/page.tsx
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/config";
import { resolveSlug } from "@/lib/team";

export default async function RootSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const res = await fetch(`${API_URL}/api/team/`, {
    cache: "no-store",
  });

  if (!res.ok) redirect("/team");

  const members = await res.json();

  const realSlug = resolveSlug(params.slug, members);

  if (!realSlug) {
    redirect("/team");
  }

  redirect(`/team/${realSlug}`);
}
