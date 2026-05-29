// lib/team.ts

// Generate canonical slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Find member ONLY by canonical slug
export function getMemberBySlug(slug: string, members: any[]): any | null {
  return (
    members.find(
      (member) => generateSlug(member.name) === slug
    ) || null
  );
}

// Resolve short or partial slug → canonical slug
export function resolveSlug(
  incomingSlug: string,
  members: any[]
): string | null {
  // 1️⃣ Exact canonical match
  const exact = members.find(
    (m) => generateSlug(m.name) === incomingSlug
  );
  if (exact) return generateSlug(exact.name);

  // 2️⃣ Prefix match (varghese → varghese-babu)
  const prefix = members.find(
    (m) => generateSlug(m.name).startsWith(incomingSlug)
  );
  if (prefix) return generateSlug(prefix.name);

  return null;
}
