import { useEffect, useState } from "react";
import { marked } from "marked";
import type { BlogPost as Post } from "./blog-utils";

interface Props {
  slug: string;
  onBack: () => void;
}

export function BlogPost({ slug, onBack }: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setPost(null);
    setError(false);
    fetch(`/api/blogs/${slug}`)
      .then(r => {
        if (!r.ok) throw new Error("not found");
        return r.json() as Promise<Post>;
      })
      .then(setPost)
      .catch(() => setError(true));
  }, [slug]);

  if (error) return (
    <section className="section">
      <button className="blog-back" onClick={onBack}>← Back</button>
      <p className="section__num">05 · Blog</p>
      <p>Post not found.</p>
    </section>
  );

  if (!post) return (
    <section className="section">
      <button className="blog-back" onClick={onBack}>← Back</button>
      <p className="section__num">05 · Blog</p>
      <p className="blog-loading">Loading…</p>
    </section>
  );

  const html = marked.parse(post.content) as string;

  return (
    <section className="section" id="blog">
      <button className="blog-back" onClick={onBack}>← All posts</button>
      <p className="section__num">05 · Blog</p>
      <h1 className="section__head">{post.title}</h1>
      <div className="blog-post__meta">
        <span className="blog-post__date">
          {new Date(post.date).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span className="blog-list__tags">
          {post.tags.map(t => (
            <span key={t} className="blog-list__tag">{t}</span>
          ))}
        </span>
      </div>
      <div
        className="blog-post__body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
