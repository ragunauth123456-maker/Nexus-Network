import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/blog/why-infrastructure")({
  component: WhyInfrastructurePost,
  head: () => ({
    meta: [
      { title: "Why Intelligence Needs Infrastructure, Not Just Better Models — Blog" },
      {
        name: "description",
        content:
          "The next frontier isn't better AI — it's connecting the AI we already have. Why the intelligence revolution demands protocol thinking, not just bigger models.",
      },
      { property: "og:title", content: "Why Intelligence Needs Infrastructure, Not Just Better Models" },
      {
        property: "og:description",
        content:
          "The next frontier isn't better AI — it's connecting the AI we already have.",
      },
      { property: "og:type", content: "article" },
    ],
  }),
});

function WhyInfrastructurePost() {
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
          <span className="text-white/60">Why Intelligence Needs Infrastructure</span>
        </div>

        {/* Article Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium text-white/30">July 26, 2026</span>
            <span className="text-white/10">·</span>
            <span className="text-xs font-medium text-indigo-400/70">Nexus Network</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-6">
            Why Intelligence Needs Infrastructure, Not Just Better Models
          </h1>

          <p className="text-lg font-medium text-white/60 leading-relaxed">
            The next frontier isn't building smarter AI. It's building the roads, rails, and
            protocols that let the intelligence we already have actually talk to each other.
          </p>
        </div>

        {/* Divider */}
        <hr className="border-white/5 mb-10" />

        {/* Article Body */}
        <article className="prose-custom">
          <h2 className="text-2xl font-bold tracking-tight mt-8 mb-6">
            The Model Race Is Missing the Point
          </h2>

          <p className="text-white/70 leading-relaxed mb-6">
            Every week brings a new model release — bigger context windows, better reasoning,
            more sophisticated outputs. Each announcement is breathlessly covered as the next
            leap forward. And each new model, like the one before it, operates in a vacuum.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            A hospital's diagnostic AI can't query a pharmaceutical company's research model.
            A factory's predictive maintenance system can't coordinate with its supplier's
            logistics AI. A climate researcher's simulation can't incorporate real-time data
            from agricultural sensors halfway across the world. These systems are individually
            brilliant and collectively useless — because there is no common layer they all
            speak.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            The hard problem isn't making models smarter. The hard problem is making them
            interoperable.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">
            What History Teaches Us About Protocols
          </h2>

          <p className="text-white/70 leading-relaxed mb-6">
            Every transformative technology wave has followed the same pattern. First comes the
            breakthrough. Then comes the chaos — incompatible systems, walled gardens,
            fragmented ecosystems. Then, finally, comes the protocol that makes everything work
            together.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            In the 1970s and early 80s, computer networking was a mess. DECnet couldn't talk to
            SNA. AppleTalk couldn't talk to either. Every vendor had their own stack, and
            connecting different networks required custom gateways, manual configuration, and
            prayer. Then TCP/IP became the standard — a single, open protocol that every network
            could implement. The Internet wasn't built by making better networks. It was built
            by making networks interoperable.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            In the early 1990s, document sharing was the same story. Gopher, WAIS, proprietary
            CD-ROM databases — every system had its own format and access method. Tim
            Berners-Lee didn't solve this by building a better document viewer. He solved it by
            creating HTTP and HTML — protocols and formats that any system could implement. The
            web wasn't built by making better documents. It was built by making documents
            universally addressable.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            Email followed the same arc. Before SMTP became the standard, there were dozens of
            incompatible messaging systems: cc:Mail, MS Mail, Lotus Notes, each operating in
            its own silo. SMTP didn't offer richer formatting or better features than the
            proprietary alternatives. It offered something more valuable: the ability to send a
            message to anyone, anywhere, regardless of what system they used. Email wasn't
            built by making better mail clients. It was built by making mail routable.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">
            Intelligence Is Where Computers Were in 1982
          </h2>

          <p className="text-white/70 leading-relaxed mb-6">
            Today's AI ecosystem is a perfect replay of pre-TCP/IP networking. Every AI agent,
            every enterprise model, every robotic system operates in isolation. They can't
            discover each other. They can't establish trust. They can't share knowledge. They
            can't coordinate work.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            The current solution to this fragmentation is worse than the problem: custom
            integrations. Point-to-point APIs. Manual legal agreements. Human intermediaries
            translating between systems. This is the equivalent of running a dedicated cable
            between every pair of computers that need to communicate — it works for three nodes
            and collapses at three thousand.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            The intelligence ecosystem needs the same thing the computer ecosystem needed: a
            common protocol. Not a better model. Not a larger context window. A standard that
            says: here is how any intelligence — human, AI, enterprise, robot — announces its
            presence on the network, establishes its identity, proves it can be trusted,
            describes what it can do, discovers what others can do, shares what it knows, and
            collaborates on work that no single intelligence could accomplish alone.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">
            Protocol Thinking
          </h2>

          <p className="text-white/70 leading-relaxed mb-6">
            Protocol thinking is fundamentally different from product thinking. A product solves
            a specific problem for a specific user. A protocol defines how an entire category of
            participants interact — it doesn't solve the problem itself; it creates the
            conditions under which thousands of products can solve thousands of problems,
            together.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            TCP/IP doesn't send your email. It doesn't load your webpage. It doesn't stream
            your video. It defines a common way for packets to move between networks, and
            everything else — email, the web, streaming, gaming, telemedicine, remote work — is
            built on top of it. The value isn't in the protocol's features. The value is in the
            universe of applications the protocol enables.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            Nexus Network applies protocol thinking to intelligence. We're not building a better
            AI. We're building the layer that lets every AI — and every human, enterprise, and
            robot — discover each other, trust each other, share knowledge, reason collectively,
            and collaborate. The applications that will be built on this layer are things we
            can't yet imagine — just as the inventors of TCP/IP couldn't imagine TikTok or
            telehealth.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">
            The Windows of Opportunity Are Narrow
          </h2>

          <p className="text-white/70 leading-relaxed mb-6">
            There's a brief window — right now — when the AI ecosystem is fragmented enough to
            need a protocol and not yet consolidated enough to resist one. Once a handful of
            dominant platforms define their own proprietary interop standards, the opportunity
            for an open protocol closes. We've seen this movie before: Facebook's walled-garden
            social graph, Apple's iMessage lock-in, Amazon's closed marketplace. Each started as
            the default because there was no open alternative, and once they reached critical
            mass, the switching costs became insurmountable.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            The intelligence layer needs to be open from the start. It needs to be designed as
            infrastructure, not a platform. Infrastructure is neutral, universal, and
            permissionless. Platforms are owned.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mt-12 mb-6">
            The Bottom Line
          </h2>

          <p className="text-white/70 leading-relaxed mb-6">
            Better models will come. They always do. But unless we build the infrastructure that
            lets those models work together — across organizations, across domains, across the
            boundary between digital and physical — they will remain isolated geniuses, each
            brilliant in its own room, each unable to talk to the others.
          </p>

          <p className="text-white/70 leading-relaxed mb-6">
            The Internet connected computers. The Web connected documents. Nexus Network
            connects intelligence. That's not a model problem. That's an infrastructure problem.
            And infrastructure problems are solved with protocols, not parameters.
          </p>

          {/* Divider */}
          <hr className="border-white/5 mb-10" />

          {/* CTA */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-center">
            <h3 className="text-xl font-bold tracking-tight mb-3">
              Help build the intelligence infrastructure.
            </h3>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Register as a Founding Node and shape the protocol from day one. Or explore
              our plans for developers and enterprises.
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
