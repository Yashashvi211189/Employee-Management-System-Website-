const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

const PROJECT_ROOT = process.cwd();

const FILES = [
  "lib/blog-data.ts",
  "app/blog/page.tsx",
  "app/blog/[slug]/page.tsx",
  "components/admin/BlogAdmin.tsx",
  "lib/admin-blog-store.ts",
].map((p) => path.join(PROJECT_ROOT, p));

const FORBIDDEN_SUBSTRINGS = [
  "via.placeholder.com",
  "placeholder.svg",
  "placeholder.jpg",
  "staticBlog",
  "No articles found.",
  "No blogs yet",
  "\"Untitled\"",
  "Nilaya AI Team",
];

test("Blogs code has no static blog placeholders or fixtures", async () => {
  const reads = await Promise.all(FILES.map((f) => fs.readFile(f, "utf8")));

  for (let i = 0; i < FILES.length; i++) {
    const filePath = FILES[i];
    const content = reads[i];

    for (const forbidden of FORBIDDEN_SUBSTRINGS) {
      assert.ok(
        !content.includes(forbidden),
        `Forbidden substring found in ${path.relative(PROJECT_ROOT, filePath)}: ${forbidden}`
      );
    }
  }
});

test("Blog transform avoids empty-string fallbacks for core fields", async () => {
  const blogDataPath = path.join(PROJECT_ROOT, "lib/blog-data.ts");
  const content = await fs.readFile(blogDataPath, "utf8");

  const forbiddenFallbackSnippets = [
    "title: apiBlog.title || \"\"",
    "slug: apiBlog.slug || \"\"",
    "category: apiBlog.category || \"\"",
    "excerpt: apiBlog.excerpt || \"\"",
    "content: apiBlog.content || \"\"",
  ];

  for (const snippet of forbiddenFallbackSnippets) {
    assert.ok(
      !content.includes(snippet),
      `Fallback snippet found in lib/blog-data.ts: ${snippet}`
    );
  }
});
