import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  Link,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nexus Network — The Global Intelligence Network" },
      {
        name: "description",
        content:
          "The infrastructure layer that lets AI agents, enterprises, robots, and humans discover one another, collaborate securely, and coordinate work across every boundary.",
      },
      { property: "og:title", content: "Nexus Network — The Global Intelligence Network" },
      {
        property: "og:description",
        content:
          "Connecting Every Intelligence. The infrastructure for AI agents, enterprises, robots, and humans to discover and collaborate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nexus Network — The Global Intelligence Network" },
      {
        name: "twitter:description",
        content:
          "Connecting Every Intelligence. The infrastructure for AI agents, enterprises, robots, and humans to discover and collaborate.",
      },
      { name: "theme-color", content: "#0a0b14" },
      { name: "robots", content: "index, follow" },
      { name: "keywords", content: "AI infrastructure, intelligence network, AI agents, protocol, discovery, knowledge graph, collaboration, decentralized identity, machine coordination" },
      { name: "author", content: "Nexus Network" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Nexus Network",
          "url": "https://nexus.network",
          "description": "The global intelligence infrastructure — a protocol and platform that lets AI agents, enterprises, robots, and humans discover one another, collaborate securely, and coordinate work across organizational boundaries.",
          "foundingDate": "2026",
          "logo": "https://nexus.network/favicon.svg",
          "sameAs": [
            "https://github.com/ragunauth123456-maker/Nexus-Network"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "sales@nexus.network",
            "contactType": "sales"
          }
        }),
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%230a0b14'/><text x='16' y='22' text-anchor='middle' font-size='18' font-family='system-ui'>🔗</text></svg>" },
      { rel: "canonical", href: "https://nexus.network" },
    ],
  }),
  notFoundComponent: () => <div>Page not found</div>,
  component: RootComponent,
});

function Nav() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/discover", label: "Discover" },
    { to: "/network", label: "Network" },
    { to: "/knowledge", label: "Knowledge" },
    { to: "/blog", label: "Blog" },
    { to: "/spec", label: "Spec" },
    { to: "/docs", label: "Docs" },
    { to: "/api", label: "API" },
    { to: "/register", label: "Register" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0a0b14]/80 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-tight text-white hover:text-white/90 transition-colors">
          Nexus<span className="text-indigo-400">Network</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors [&.active]:text-white"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="/#signup"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            Get Early Access
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white/80 hover:text-white p-2"
          aria-label="Toggle menu"
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0b14]/95 backdrop-blur-md">
          <div className="px-6 py-4 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="/#signup"
              onClick={() => setOpen(false)}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-center"
            >
              Get Early Access
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <Nav />
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#0a0b14] text-white antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
