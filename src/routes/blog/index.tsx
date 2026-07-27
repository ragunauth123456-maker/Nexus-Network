import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
  head: () => ({
    meta: [
      { title: "Blog — Nexus Network" },
      {
        name: "description",
        content: "Updates, announcements, and insights from the Nexus Network team.",
      },
    ],
  }),
});

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
}

const POSTS: BlogPost[] = [
  {
    slug: "/blog/launch",
    title: "Introducing Nexus Network: The Global Intelligence Network",
    date: "July 26, 2026",
    excerpt:
      "We connected computers. Then documents. Then people. Now we're connecting intelligence itself. In 2026, intelligence is exactly where computers were in 1982. Every AI agent, every enterprise system, every robot operates in isolation. Nexus Network is the protocol that connects them.",
    author: "Nexus Network",
  },
  {
    slug: "/blog/why-infrastructure",
    title: "Why Intelligence Needs Infrastructure, Not Just Better Models",
    date: "July 26, 2026",
    excerpt:
      "The next frontier isn't building smarter AI. It's building the roads, rails, and protocols that let the intelligence we already have actually talk to each other. Why the intelligence revolution demands protocol thinking, not just bigger models.",
    author: "Nexus Network",
  },
];

function BlogIndex() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
          <Link to="/" className="hover:text-white/60 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-white/60">Blog</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
          Blog
        </h1>
        <p className="text-lg text-white/50 mb-12 max-w-2xl">
          Updates, announcements, and insights from the Nexus Network team.
        </p>

        {/* Post Cards */}
        <div className="space-y-6">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              to={post.slug}
              className="block p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium text-white/30">
                  {post.date}
                </span>
                <span className="text-white/10">·</span>
                <span className="text-xs font-medium text-indigo-400/70">
                  {post.author}
                </span>
              </div>

              <h2 className="text-xl font-semibold tracking-tight mb-2 group-hover:text-indigo-300 transition-colors">
                {post.title}
              </h2>

              <p className="text-sm text-white/50 leading-relaxed mb-4">
                {post.excerpt}
              </p>

              <span className="text-sm font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors inline-flex items-center gap-1">
                Read more
                <svg
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/30 text-sm">
            © {new Date().getFullYear()} Nexus Network. Building the global intelligence infrastructure.
          </span>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link to="/blog" className="hover:text-white/60 transition-colors">
              Blog
            </Link>
            <Link to="/spec" className="hover:text-white/60 transition-colors">
              Protocol Spec
            </Link>
            <Link to="/docs" className="hover:text-white/60 transition-colors">
              Docs
            </Link>
            <Link to="/api" className="hover:text-white/60 transition-colors">
              API
            </Link>
            <Link to="/network" className="hover:text-white/60 transition-colors">
              Network
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
