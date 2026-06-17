import { readdirSync, readFileSync } from "fs";
import { join } from "path";

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  draft: boolean;
}

export interface BlogPost extends BlogMeta {
  content: string;
}

function parseFrontmatter(raw: string): { meta: Omit<BlogMeta, "slug">; content: string } {
  const match = raw.match(/^\+\+\+\n([\s\S]*?)\n\+\+\+\n([\s\S]*)$/);
  if (!match) return { meta: { title: "", date: "", tags: [], draft: false }, content: raw };

  const toml = match[1];
  const content = match[2].trim();

  const title = toml.match(/^title\s*=\s*['"](.+?)['"]/m)?.[1] ?? "";
  const date = toml.match(/^date\s*=\s*['"](.+?)['"]/m)?.[1] ?? "";
  const draftStr = toml.match(/^draft\s*=\s*(true|false)/m)?.[1];
  const draft = draftStr === "true";
  const tagsMatch = toml.match(/^tags\s*=\s*\[([^\]]*)\]/m);
  const tags = tagsMatch
    ? tagsMatch[1].split(",").map(t => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean)
    : [];

  return { meta: { title, date, tags, draft }, content };
}

function slugify(filename: string): string {
  return filename.replace(/\.md$/, "");
}

const BLOGS_DIR = join(import.meta.dir, "..", "content", "blogs");

export function listBlogs(): BlogMeta[] {
  let files: string[];
  try {
    files = readdirSync(BLOGS_DIR).filter(f => f.endsWith(".md"));
  } catch {
    return [];
  }

  return files
    .map(file => {
      const raw = readFileSync(join(BLOGS_DIR, file), "utf-8");
      const { meta } = parseFrontmatter(raw);
      return { slug: slugify(file), ...meta };
    })
    .filter(p => !p.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlog(slug: string): BlogPost | null {
  const filePath = join(BLOGS_DIR, `${slug}.md`);
  let raw: string;
  try {
    raw = readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
  const { meta, content } = parseFrontmatter(raw);
  if (meta.draft) return null;
  return { slug, ...meta, content };
}
