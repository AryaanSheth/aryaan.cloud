import type { BlogMeta } from "./blog-utils";

interface Props {
  posts: BlogMeta[];
  onSelect: (slug: string) => void;
}

export function BlogList({ posts, onSelect }: Props) {
  return (
    <section className="section" id="blog">
      <p className="section__num">04 · Blog</p>
      <h2 className="section__head">Writing on things I build and learn.</h2>
      <div className="section__body">
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul className="blog-list">
            {posts.map(post => (
              <li key={post.slug} className="blog-list__item">
                <button
                  className="blog-list__title"
                  onClick={() => onSelect(post.slug)}
                >
                  {post.title}
                </button>
                <div className="blog-list__meta">
                  <span className="blog-list__date">
                    {new Date(post.date).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="blog-list__tags">
                    {post.tags.map(t => (
                      <span key={t} className="blog-list__tag">{t}</span>
                    ))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
