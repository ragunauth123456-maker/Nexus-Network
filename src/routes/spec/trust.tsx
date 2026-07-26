import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/spec/trust")({
  component: TrustSpec,
});

function Breadcrumbs({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
      <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
      <span>/</span>
      <Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link>
      <span>/</span>
      <span className="text-white/60">{current}</span>
    </div>
  );
}

function TocSidebar() {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "overview", label: "Overview" },
    { id: "zk-proofs", label: "Zero-Knowledge Proofs" },
    { id: "reputation", label: "Reputation Graphs" },
    { id: "verifiable-credentials", label: "Verifiable Credentials" },
    { id: "trust-models", label: "Trust Models" },
    { id: "policy", label: "Policy & Consent" },
    { id: "assertion-schema", label: "Trust Assertion Schema" },
  ];

  return (
    <>
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white transition-colors w-full justify-between"
        >
          <span>Table of Contents</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="mt-2 p-4 rounded-lg bg-white/[0.03] border border-white/5">
            <nav className="flex flex-col gap-2">
              {items.map((item) => (
                <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)} className="text-sm text-white/50 hover:text-white transition-colors py-1">{item.label}</a>
              ))}
            </nav>
          </div>
        )}
      </div>
      <div className="hidden lg:block sticky top-24">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">On this page</p>
        <nav className="flex flex-col gap-1.5 border-l border-white/10 pl-4">
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`} className="text-sm text-white/45 hover:text-indigo-400 transition-colors py-0.5">{item.label}</a>
          ))}
        </nav>
      </div>
    </>
  );
}

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-xl bg-[#0d0f1a] border border-white/10 overflow-hidden">
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/30 font-mono">{lang}</span>
        <span className="text-xs text-white/20">schema</span>
      </div>
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed"><code className="text-white/80 font-mono">{code}</code></pre>
    </div>
  );
}

function TrustSpec() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex gap-10">
          <div className="hidden lg:block w-56 shrink-0"><TocSidebar /></div>
          <div className="flex-1 min-w-0">
            <Breadcrumbs current="Universal Trust Layer" />
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Universal Trust Layer</h1>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider shrink-0">Draft</span>
            </div>
            <p className="text-lg text-white/50 mb-12 max-w-3xl">
              NNP Trust Layer (NNP-TR) — Establishes verifiable trust between nodes on the network
              without relying on centralized authorities. Combines zero-knowledge proofs,
              reputation graphs, and verifiable credentials to create a decentralized web of trust.
            </p>
            <div className="lg:hidden"><TocSidebar /></div>

            <section id="overview" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">1. Overview</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  In a network where any intelligence can join, the fundamental question is not "Who are you?"
                  (answered by the Identity Layer) but <strong>"Can I trust you for this task?"</strong>. The
                  Universal Trust Layer answers this question through cryptographic proofs and decentralized
                  reputation mechanisms, not through a central authority's say-so.
                </p>
                <p>
                  Trust on Nexus Network is <strong>contextual</strong>, <strong>composable</strong>, and{" "}
                  <strong>privacy-preserving</strong>. A node does not need to reveal its internal data to
                  prove it is trustworthy for a specific interaction. Zero-knowledge proofs allow a node to
                  demonstrate that it satisfies a trust policy without exposing the underlying evidence.
                </p>
                <p>
                  The Trust Layer operates continuously: every interaction on the network generates
                  cryptographically signed attestations that feed into an evolving, weighted reputation graph.
                  Nodes that behave well accumulate positive reputation; malicious actors are rapidly isolated.
                </p>
              </div>
            </section>

            <section id="zk-proofs" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">2. Zero-Knowledge Proofs</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Zero-Knowledge Proofs (ZKPs) are the cryptographic primitive that enables trust without
                  exposure. A node can prove statements like:
                </p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li>"I hold a valid professional engineering license" — without revealing the license number or issuing authority.</li>
                  <li>"I have successfully completed 1,000+ bridge design projects" — without exposing client details.</li>
                  <li>"My AI model was trained on a dataset that complies with EU AI Act requirements" — without disclosing the dataset itself.</li>
                </ul>
                <p className="mt-3">
                  NNP-TR uses a combination of <strong>zk-SNARKs</strong> (for succinct, constant-size proofs)
                  and <strong>BBS+ signatures</strong> (for selective disclosure of credential attributes). The
                  proving system is designed to be efficient enough for resource-constrained devices while
                  maintaining the 128-bit security level required for high-stakes industrial applications.
                </p>
              </div>
            </section>

            <section id="reputation" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">3. Reputation Graphs</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Beyond cryptographic proofs, the Trust Layer maintains a decentralized reputation graph.
                  Every completed collaboration generates a signed <strong>outcome attestation</strong> — a
                  Verifiable Credential that rates the interaction along dimensions like timeliness, quality,
                  and adherence to contract terms. These attestations are weighted by the issuer's own
                  reputation, creating a transitive trust model similar to Google's PageRank but for
                  trustworthiness.
                </p>
                <p>
                  The reputation graph is <strong>not globally visible</strong>. Nodes control which
                  attestations they reveal. A node might choose to reveal manufacturing quality attestations
                  when bidding on a manufacturing contract but keep healthcare-related attestations private.
                  This is enforced cryptographically through the BBS+ selective disclosure scheme.
                </p>
              </div>
            </section>

            <section id="verifiable-credentials" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">4. Verifiable Credentials</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  NNP-TR adopts the W3C Verifiable Credentials Data Model v2.0 as its attestation format.
                  Three roles participate in every credential exchange:
                </p>
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  {[
                    { role: "Issuer", desc: "Creates and signs the credential (e.g., a licensing board, a university, a previous collaboration partner)." },
                    { role: "Holder", desc: "The node that holds the credential and presents it to verifiers. Controls which attributes are revealed." },
                    { role: "Verifier", desc: "The node that requests and verifies the credential against a trust policy before proceeding with an interaction." },
                  ].map((r) => (
                    <div key={r.role} className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                      <h4 className="text-sm font-semibold text-indigo-400 mb-2">{r.role}</h4>
                      <p className="text-xs text-white/45 leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="trust-models" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">5. Trust Models</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>NNP-TR supports three composable trust models that nodes can combine:</p>
                <div className="space-y-3 mt-4">
                  {[
                    { model: "Direct Trust", desc: "Node A trusts Node B because A has directly observed B's behavior over multiple interactions. The strongest form of trust, but slow to bootstrap." },
                    { model: "Transitive Trust", desc: "Node A trusts Node B because A trusts Node C, and C vouches for B. Weighted by the path length and the trustworthiness of intermediate nodes. Enables rapid scaling of the trust network." },
                    { model: "Delegated Trust", desc: "Node A delegates trust decisions to a Trust Oracle — a specialized node (or a quorum of nodes) that evaluates credentials and produces a trust score. Useful when A lacks the expertise to evaluate complex credentials (e.g., medical certifications)." },
                  ].map((item) => (
                    <div key={item.model} className="flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider shrink-0 mt-0.5 w-24">{item.model}</span>
                      <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="policy" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">6. Policy Enforcement & Consent</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  Trust is not binary — it is governed by <strong>trust policies</strong> that define the
                  minimum requirements for specific interactions. A policy might state: "To access my
                  patient data, you must present a valid HIPAA compliance credential, a medical license
                  credential, and a signed data-use agreement."
                </p>
                <p>
                  Policies are expressed in a declarative policy language (NNP-PL) that compiles to
                  zero-knowledge circuits. When a verifier presents a policy, the holder's node
                  automatically evaluates which credentials satisfy it and constructs a minimal ZK proof.
                  The holder explicitly consents to each disclosure — no credential is revealed without
                  the holder's knowledge and approval.
                </p>
              </div>
            </section>

            <section id="assertion-schema" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">7. Trust Assertion Schema</h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Every trust-relevant interaction on the network produces a signed Trust Assertion:
              </p>
              <CodeBlock code={`{
  "@context": "https://nexus.network/ns/trust/v1",
  "id": "urn:nnp-tr:assertion:8f3a...c21b",
  "type": "OutcomeAttestation",
  "issuer": "did:nnp:z6MkrJV...2HtQw",
  "subject": "did:nnp:z6MkhaX...8EfV1",
  "issuedAt": "2026-07-15T09:30:00Z",
  "credential": {
    "interactionType": "BridgeDesignReview",
    "dimensions": {
      "quality": { "score": 0.94, "maxScore": 1.0 },
      "timeliness": { "score": 0.88, "maxScore": 1.0 },
      "compliance": { "score": 1.0, "maxScore": 1.0 }
    },
    "summary": "Exceptional structural analysis. Minor delays in iteration 3."
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-07-15T09:30:00Z",
    "verificationMethod": "did:nnp:z6MkrJV...2HtQw#key-1",
    "proofValue": "z5n2b...8Kq91"
  }
}`} />
            </section>
          </div>
        </div>
      </div>
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/30 text-sm">© {new Date().getFullYear()} Nexus Network.</span>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link to="/spec" className="hover:text-white/60 transition-colors">Spec</Link>
            <Link to="/docs" className="hover:text-white/60 transition-colors">Docs</Link>
            <Link to="/api" className="hover:text-white/60 transition-colors">API</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
