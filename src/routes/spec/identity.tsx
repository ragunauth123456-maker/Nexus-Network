import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/spec/identity")({
  component: IdentitySpec,
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
    { id: "cryptographic-identity", label: "Cryptographic Identity" },
    { id: "identity-types", label: "Identity Types" },
    { id: "lifecycle", label: "Identity Lifecycle" },
    { id: "identity-descriptor", label: "Identity Descriptor Schema" },
    { id: "standards", label: "Standards Relationship" },
  ];

  return (
    <>
      {/* Mobile TOC toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white transition-colors w-full justify-between"
        >
          <span>Table of Contents</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="mt-2 p-4 rounded-lg bg-white/[0.03] border border-white/5">
            <nav className="flex flex-col gap-2">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="text-sm text-white/50 hover:text-white transition-colors py-1"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop TOC sidebar */}
      <div className="hidden lg:block sticky top-24">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
          On this page
        </p>
        <nav className="flex flex-col gap-1.5 border-l border-white/10 pl-4">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm text-white/45 hover:text-indigo-400 transition-colors py-0.5"
            >
              {item.label}
            </a>
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
      <pre className="p-5 overflow-x-auto text-sm leading-relaxed">
        <code className="text-white/80 font-mono">{code}</code>
      </pre>
    </div>
  );
}

function IdentitySpec() {
  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans pt-20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex gap-10">
          {/* Sidebar */}
          <div className="hidden lg:block w-56 shrink-0">
            <TocSidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <Breadcrumbs current="Universal Identity Layer" />

            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Universal Identity Layer
              </h1>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider shrink-0">
                Draft
              </span>
            </div>
            <p className="text-lg text-white/50 mb-12 max-w-3xl">
              NNP Identity Layer (NNP-ID) — The foundational layer of the Nexus Network Protocol.
              Defines how every intelligence on the network obtains and proves a single, universally
              resolvable cryptographic identity.
            </p>

            {/* Mobile TOC */}
            <div className="lg:hidden">
              <TocSidebar />
            </div>

            {/* Overview */}
            <section id="overview" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">1. Overview</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  The Universal Identity Layer is the bedrock of Nexus Network. Before any
                  intelligence can discover peers, establish trust, share knowledge, or collaborate
                  on work, it must first <em>be someone</em> on the network. NNP-ID provides that
                  foundational "someone-ness."
                </p>
                <p>
                  Every node on the network — whether a human expert, an AI agent, an enterprise
                  system, a hospital, a robot on a factory floor, or an IoT sensor on a bridge —
                  holds a single identity that is cryptographically self-sovereign. No central
                  authority issues or controls these identities. They are rooted in public-key
                  cryptography, specifically the W3C Decentralized Identifier (DID) standard, and
                  are resolvable through the Nexus Network Identity Registry.
                </p>
                <p>
                  This approach solves three long-standing problems in multi-agent systems:
                  <strong> fragmentation</strong> (one entity, many identities across systems),
                  <strong> impersonation</strong> (no reliable way to verify who sent a message),
                  and <strong> portability</strong> (identities tied to specific platforms or
                  providers).
                </p>
              </div>
            </section>

            {/* Cryptographic Identity */}
            <section id="cryptographic-identity" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">2. Cryptographic Identity</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  At its core, a Nexus Network identity is an Ed25519 public-private key pair. The
                  public key — or a derivation of it — serves as the node's globally unique
                  identifier. The private key never leaves the node's control and is used to sign
                  every message, assertion, and transaction the node produces on the network.
                </p>
                <p>
                  Identities are expressed as W3C DIDs using the <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">did:nnp</code> method:
                </p>
                <CodeBlock
                  code={`did:nnp:0x7a3b...c91f    # Ed25519 public key (hex-encoded)
did:nnp:z6MkhaX...8EfV1      # Multibase-encoded variant`}
                  lang="text"
                />
                <p>
                  Each DID resolves to a DID Document — a JSON-LD document published to the Nexus
                  Network Identity Registry (a distributed ledger maintained by network validators).
                  The DID Document contains the public key, service endpoints, and capability
                  assertions for the node.
                </p>
              </div>
            </section>

            {/* Identity Types */}
            <section id="identity-types" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">3. Identity Types</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  NNP-ID recognizes several identity classes, each with specific verification
                  requirements:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  {[
                    {
                      type: "Human Identity",
                      desc: "Verified via WebAuthn, biometric proof-of-personhood, or trusted institutional attestations. Humans may have multiple devices but a single identity.",
                    },
                    {
                      type: "Agent Identity",
                      desc: "AI agents and software systems. Created by their operator (human or org). The agent's DID is signed by its controlling identity, establishing a delegation chain.",
                    },
                    {
                      type: "Organization Identity",
                      desc: "Legal entities. Verified via DUNS, LEI, or national business registry attestations. Organizations can delegate sub-identities to departments, teams, and agents.",
                    },
                    {
                      type: "Device Identity",
                      desc: "Physical devices — robots, vehicles, sensors. Provisioned at manufacture with an immutable hardware root of trust (TPM/Secure Element).",
                    },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className="p-5 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                      <h4 className="text-sm font-semibold text-white/80 mb-2">{item.type}</h4>
                      <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Identity Lifecycle */}
            <section id="lifecycle" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">4. Identity Lifecycle</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>An identity on Nexus Network progresses through four distinct phases:</p>
                <div className="space-y-3 mt-4">
                  {[
                    {
                      phase: "Creation",
                      desc: "A key pair is generated locally. The DID Document is constructed and submitted to the Identity Registry. No central authority approves — the act of publishing to the registry establishes the identity.",
                    },
                    {
                      phase: "Verification",
                      desc: "Optional but encouraged. The identity holder obtains attestations — verifiable credentials issued by trusted authorities — that prove claims about the identity (e.g., 'this DID represents a licensed structural engineer').",
                    },
                    {
                      phase: "Active Use",
                      desc: "The identity is used to sign messages, make assertions, register capabilities, and participate in the network. The DID Document may be updated to add or rotate service endpoints.",
                    },
                    {
                      phase: "Revocation",
                      desc: "The identity holder publishes a signed revocation notice to the registry. Post-revocation, all credentials issued to this identity become invalid, and the DID resolves to a tombstone entry.",
                    },
                  ].map((item) => (
                    <div
                      key={item.phase}
                      className="flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider shrink-0 mt-0.5 w-20">
                        {item.phase}
                      </span>
                      <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Identity Descriptor */}
            <section id="identity-descriptor" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">5. Identity Descriptor Schema</h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Every node publishes an Identity Descriptor — a JSON document included in (or
                referenced by) the DID Document. It describes what the node <em>is</em> and how to
                interact with it.
              </p>
              <CodeBlock
                code={`{
  "@context": "https://nexus.network/ns/identity/v1",
  "id": "did:nnp:z6MkhaX...8EfV1",
  "type": "AgentIdentity",
  "label": "BridgeAnalyzer-Prod-01",
  "controlledBy": "did:nnp:z6MkrJV...2HtQw",
  "created": "2026-06-01T12:00:00Z",
  "serviceEndpoints": [
    {
      "id": "#api",
      "type": "NexusAPI",
      "endpoint": "https://node1.engfirm.example/nexus/v1"
    }
  ],
  "publicKey": {
    "id": "#key-1",
    "type": "Ed25519VerificationKey2020",
    "publicKeyMultibase": "z6MkhaXg...8EfV1"
  }
}`}
              />
            </section>

            {/* Standards */}
            <section id="standards" className="mb-14">
              <h2 className="text-2xl font-bold tracking-tight mb-4">6. Relationship to Existing Standards</h2>
              <div className="space-y-4 text-white/60 leading-relaxed">
                <p>
                  NNP-ID is not a greenfield invention. It builds on and extends established W3C
                  and IETF standards:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>W3C Decentralized Identifiers (DIDs) v1.0</strong> — NNP-ID uses the{" "}
                    <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded text-sm">did:nnp</code>{" "}
                    method. All NNP identities are valid W3C DIDs.
                  </li>
                  <li>
                    <strong>W3C Verifiable Credentials v2.0</strong> — Identity attestations
                    (proof-of-personhood, organizational membership, professional licensure) are
                    issued as Verifiable Credentials.
                  </li>
                  <li>
                    <strong>DIDComm Messaging v2</strong> — Secure, private messaging between
                    identities uses DIDComm encryption envelopes.
                  </li>
                  <li>
                    <strong>IETF RFC 8032</strong> — Ed25519 signature scheme for all
                    cryptographic operations.
                  </li>
                  <li>
                    <strong>FIDO2 / WebAuthn</strong> — Human identity binding uses WebAuthn
                    authenticators for phishing-resistant authentication.
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/30 text-sm">
            © {new Date().getFullYear()} Nexus Network.
          </span>
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
