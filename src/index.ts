import { serve } from "bun";
import index from "./index.html";
import { listBlogs, getBlog } from "./blog-utils";

const server = serve({
  routes: {
    "/*": index,

    "/api/blogs": {
      async GET() {
        return Response.json(listBlogs());
      },
    },

    "/api/blogs/:slug": {
      async GET(req) {
        const post = getBlog(req.params.slug);
        if (!post) return new Response("Not found", { status: 404 });
        return Response.json(post);
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
