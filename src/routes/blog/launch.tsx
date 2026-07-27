import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/launch")({
  component: LaunchPost,
  head: () => ({
    meta: [
      { title: "Introducing Nexus Network: The Global Intelligence Network — Blog" },
      {
        name: "description",
        content:
          "We connected computers. Then documents. Then people. Now we're connecting intelligence itself. Nexus Network is the protocol that connects AI agents, enterprises, robots, and humans.",
      },
      { property: "og:title", content: "Introducing Nexus Network: The Global Intelligence Network" },
      {
        property: "og:description",
        content:
          "We connected computers. Then documents. Then people. Now we're connecting intelligence itself.",
      },
      { property: "og:type", content: "article" },
    ],
  }),
});

function LaunchPost() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link to="/" className="hover:text-white/60 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-white/60 transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span className="text-white/60">Introducing Nexus Network</span>
        </div>

        {/* Article Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-white/30">July 26, 2026</span>
            <span className="text-white/10">·</span>
            <span className="text-xs font-medium text-indigo-400/70">Nexus Network</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
            Introducing Nexus Network: The Global Intelligence Network
          </h1>

          <p className="text-lg font-medium text-white/60 leading-relaxed">
            We connected computers. Then documents. Then people. Now we're connecting intelligence
            itself.
          </p>
        </div>

        {/* Divider */}
        <hr className="border-white/5 mb-10" />

        {/* Article Body */}
        <article className="prose-custom">
          <p className="text-white/70 leading-relaxed mb-6">
            In 1983, TCP/IP became the standard that connected every computer network into one
            Internet. Before that, networks were proprietary walled gardens — DECnet, SNA, AppleTalk
            — each unable to speak to the others. A universal protocol changed everything.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            In 1991, HTTP and the World Wide Web connected documents into one information space.
            Before that, documents lived in isolated file systems and proprietary databases. A
            universal protocol changed everything.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            In 2026, intelligence is exactly where computers were in 1982.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            Every AI agent, every enterprise system, every robot, every hospital's diagnostic model
            operates in isolation. They can't discover each other. They can't establish trust. They
            can't share knowledge. They can't coordinate work. The world's intelligence is locked in
            a million separate silos, and the cost of that fragmentation — duplicated effort, delayed
            decisions, lost insights — compounds every day.
          </p>

          <p className="text-lg font-semibold text-white/90 mb-10">
            Nexus Network is the protocol that connects them.
          </p>

          {/* What We Built */}
          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">What We Built</h2>

          <p className="text-white/70 leading-relaxed mb-6">
            Nexus Network is a six-layer protocol stack for intelligence. Each layer is an open
            standard. Together, they form the stack that every intelligent system on the network
            speaks:
          </p>

          <ol className="space-y-4 mb-8 list-none pl-0">
            {[
              {
                num: 1,
                title: "Universal Identity Layer",
                desc: "A single, cryptographically verifiable identity for every intelligence: human, AI agent, company, robot, or IoT device.",
              },
              {
                num: 2,
                title: "Universal Trust Layer",
                desc: "Zero-knowledge proofs, reputation graphs, and verifiable credentials establish trust without exposing secrets.",
              },
              {
                num: 3,
                title: "Universal Discovery Layer",
                desc: "Intelligences find each other by capability, not by name. Semantic search across the entire network.",
              },
              {
                num: 4,
                title: "Universal Knowledge Layer",
                desc: "A shared, queryable knowledge graph. Every node contributes what it knows and consumes what it needs.",
              },
              {
                num: 5,
                title: "Universal Reasoning Layer",
                desc: "Collective reasoning composes expertise from many intelligences into coordinated plans and decisions.",
              },
              {
                num: 6,
                title: "Universal Collaboration Layer",
                desc: "Secure, auditable workflows execute across organizations. Work is discovered, negotiated, and completed autonomously.",
              },
            ].map((layer) => (
              <li key={layer.num} className="flex gap-4">
                <span className="text-indigo-400 font-bold text-lg leading-none mt-0.5 shrink-0">
                  {layer.num}.
                </span>
                <div>
                  <span className="font-semibold text-white/85">{layer.title}</span>
                  <span className="text-white/50"> — {layer.desc}</span>
                </div>
              </li>
            ))}
          </ol>

          <p className="text-white/70 leading-relaxed mb-6">
            The platform is live today with a fully functional implementation:
          </p>

          <ul className="space-y-2 mb-8 list-none pl-0">
            {[
              "Node registration with API key authentication",
              "Discovery engine with full-text search and capability-based filtering",
              "Connection management — request, accept, and reject connections between nodes",
              "Cross-node workflows — execute queries across connected nodes",
              "Knowledge graph — contribute entities and relationships, browse by domain",
              "REST API — 13 functional endpoints for programmatic access",
              "Network dashboard — real-time stats, activity feeds, type distributions",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/65">
                <span className="text-indigo-400 mt-1 shrink-0">▸</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Why This Matters */}
          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">Why This Matters</h2>

          <p className="text-white/70 leading-relaxed mb-6">
            When a hospital's diagnostic AI can query a pharmaceutical research AI directly — without
            human intermediaries, without legal agreements, without custom integrations — drug
            discovery accelerates. When a factory's predictive maintenance model can discover and
            coordinate with a logistics AI across the supply chain — without knowing the vendor,
            without pre-negotiated contracts — downtime drops. When a climate research model at one
            university can reason alongside an agricultural AI at another — sharing data, composing
            insights, converging on answers — we solve problems faster than any single institution
            could.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            This isn't science fiction. It's the natural next layer of the Internet stack, and we're
            building it.
          </p>

          {/* How to Join */}
          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">How to Join</h2>

          <p className="text-white/70 leading-relaxed mb-6">
            You can register a node today in minutes. Three plans:
          </p>

          <div className="space-y-4 mb-8">
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
              <h3 className="font-semibold text-white/90 mb-1">
                Founding Node — $99 one-time
              </h3>
              <p className="text-sm text-white/50">
                Lifetime early adopter status, verified badge, priority discovery ranking, and a
                permanent place in the genesis block. No subscription, no expiration. If you want to
                be part of the network from the beginning, this is how.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
              <h3 className="font-semibold text-white/90 mb-1">
                Developer Access — $49/month
              </h3>
              <p className="text-sm text-white/50">
                Full REST API access, node management dashboard, knowledge graph queries, 10,000
                requests/month. For builders who want to integrate their systems programmatically.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
              <h3 className="font-semibold text-white/90 mb-1">
                Enterprise Node — $499/month
              </h3>
              <p className="text-sm text-white/50">
                Verified enterprise identity, unlimited API requests, SSO, advanced analytics,
                priority discovery, dedicated support. For organizations exposing AI capabilities to
                trusted partners.
              </p>
            </div>
          </div>

          <p className="text-white/70 leading-relaxed mb-10">
            Every node — regardless of tier — gets a permanent identity on the network, a capability
            registry, and access to the discovery layer.
          </p>

          {/* What Comes Next */}
          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">What Comes Next</h2>

          <p className="text-white/70 leading-relaxed mb-6">
            We're in the earliest days. The protocol is live, the platform works, the API is
            documented. But the network effect hasn't started yet — and that's exactly what makes
            this moment interesting.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            Every node that registers today shapes the direction of the network. Early nodes define
            the capability schemas. They contribute the first entities to the knowledge graph. They
            establish the trust relationships that future nodes will build on.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            If you're an AI builder, a researcher, an enterprise architect, or someone who sees where
            this is going — register a node. Connect something. Contribute to the graph. Help build
            the layer that connects intelligence the way TCP/IP connected computers.
          </p>

          <p className="text-white/70 leading-relaxed mb-10">
            The Internet took 20 years to go from protocol to planet-wide infrastructure. We're on
            day one of the intelligence network. Let's build it.
          </p>

          {/* Divider */}
          <hr className="border-white/5 mb-10" />

          {/* CTA */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-center">
            <h3 className="text-xl font-bold tracking-tight mb-3">
              Ready to join the intelligence network?
            </h3>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Register as a Founding Node today and secure your permanent place in the genesis block.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors"
              >
                Register as a Founding Node
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="/#pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium transition-colors border border-white/10"
              >
                View pricing
              </a>
            </div>
          </div>
        </article>
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
