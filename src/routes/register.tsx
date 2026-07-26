import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { registerNode, type Capability } from "~/lib/nodes";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

// ──────────────────────────────────────────
// Constants
// ──────────────────────────────────────────

const NODE_TYPES: { value: string; emoji: string; label: string }[] = [
  { value: "human", emoji: "🧑", label: "Human" },
  { value: "ai_agent", emoji: "🤖", label: "AI Agent" },
  { value: "company", emoji: "🏢", label: "Company" },
  { value: "government", emoji: "🏛️", label: "Government" },
  { value: "hospital", emoji: "🏥", label: "Hospital" },
  { value: "university", emoji: "🎓", label: "University" },
  { value: "factory", emoji: "🏭", label: "Factory" },
  { value: "vehicle", emoji: "🚗", label: "Vehicle" },
  { value: "robot", emoji: "🦾", label: "Robot" },
  { value: "digital_twin", emoji: "🪞", label: "Digital Twin" },
  { value: "iot_device", emoji: "📡", label: "IoT Device" },
  { value: "other", emoji: "⚡", label: "Other" },
];

const TRUST_LEVELS = [
  { value: 1, label: "New" },
  { value: 2, label: "Developing" },
  { value: 3, label: "Established" },
  { value: 4, label: "Trusted" },
  { value: 5, label: "Highly Trusted" },
];

const CAP_CATEGORIES = [
  "reasoning", "knowledge", "automation", "sensing",
  "computation", "communication", "other",
];

// ──────────────────────────────────────────
// Page component
// ──────────────────────────────────────────

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [nodeType, setNodeType] = useState("");
  const [description, setDescription] = useState("");
  const [trustLevel, setTrustLevel] = useState(1);
  const [capabilities, setCapabilities] = useState<Capability[]>([
    { name: "", category: "reasoning", description: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedEmoji = NODE_TYPES.find((t) => t.value === nodeType)?.emoji ?? "⚡";

  function addCapability() {
    setCapabilities([...capabilities, { name: "", category: "reasoning", description: "" }]);
  }

  function removeCapability(index: number) {
    if (capabilities.length > 1) {
      setCapabilities(capabilities.filter((_, i) => i !== index));
    }
  }

  function updateCapability(index: number, field: keyof Capability, value: string) {
    const updated = [...capabilities];
    updated[index] = { ...updated[index], [field]: value };
    setCapabilities(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await registerNode({
        data: { name, node_type: nodeType, description, trust_level: trustLevel, capabilities },
      });
      navigate({ to: `/nodes/${result.id}` });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#0a0b14] text-white font-sans">
      <div className="pt-24 pb-16 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6">
          <div className="flex items-center gap-2 text-sm text-white/40 mb-6">
            <Link to="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/60">Register</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Register a Node
          </h1>
          <p className="text-lg text-white/50">
            Add an intelligence to the Nexus Network. Every node — human, AI, or machine — gets a
            verifiable identity and capability profile.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Node Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Node Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Logistics AI, Dr. Jane Smith"
              required
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          {/* Node Type */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Node Type <span className="text-red-400">*</span>
            </label>
            <select
              value={nodeType}
              onChange={(e) => setNodeType(e.target.value)}
              required
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50 appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1rem",
              }}
            >
              <option value="" disabled>Select a node type...</option>
              {NODE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.emoji} {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this node do? What capabilities does it offer?"
              rows={4}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50 resize-y"
            />
            <p className="text-xs text-white/30 mt-1">{description.length}/2000</p>
          </div>

          {/* Trust Level */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-3">
              Trust Level
            </label>
            <div className="flex items-center gap-2">
              {TRUST_LEVELS.map((tl) => (
                <button
                  key={tl.value}
                  type="button"
                  onClick={() => setTrustLevel(tl.value)}
                  disabled={submitting}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-sm font-medium transition-all border ${
                    trustLevel === tl.value
                      ? "bg-indigo-500/20 border-indigo-400/50 text-indigo-300"
                      : "bg-white/5 border-white/10 text-white/50 hover:text-white/70 hover:border-white/20"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    {Array.from({ length: tl.value }).map((_, i) => (
                      <span key={i} className="text-xs">●</span>
                    ))}
                    {Array.from({ length: 5 - tl.value }).map((_, i) => (
                      <span key={i} className="text-xs text-white/20">●</span>
                    ))}
                  </div>
                  <span className="text-xs">{tl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-white/70">
                Capabilities
              </label>
              <button
                type="button"
                onClick={addCapability}
                disabled={submitting}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
              >
                + Add Capability
              </button>
            </div>
            <div className="space-y-4">
              {capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/40">Capability #{i + 1}</span>
                    {capabilities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCapability(i)}
                        disabled={submitting}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={cap.name}
                    onChange={(e) => updateCapability(i, "name", e.target.value)}
                    placeholder="Capability name (e.g. Natural Language Processing)"
                    disabled={submitting}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50"
                  />
                  <select
                    value={cap.category}
                    onChange={(e) => updateCapability(i, "category", e.target.value)}
                    disabled={submitting}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      backgroundSize: "0.75rem",
                    }}
                  >
                    {CAP_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={cap.description}
                    onChange={(e) => updateCapability(i, "description", e.target.value)}
                    placeholder="Short description of this capability"
                    disabled={submitting}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {name && nodeType && (
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                Preview
              </p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{selectedEmoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white/80">{name || "Unnamed Node"}</p>
                  <p className="text-xs text-white/40">
                    {NODE_TYPES.find((t) => t.value === nodeType)?.label ?? nodeType}
                    {" · "}Trust Level {trustLevel}
                  </p>
                </div>
              </div>
              {capabilities.filter((c) => c.name).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {capabilities.filter((c) => c.name).map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/60"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !name.trim() || !nodeType}
            className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/30 text-white font-semibold text-lg transition-all duration-200 shadow-lg shadow-indigo-500/20 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Registering Node…</span>
              </>
            ) : (
              "Register Node"
            )}
          </button>
          <p className="text-xs text-white/25 text-center mt-2">
            Your node will be immediately discoverable on the network.
          </p>
        </form>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/30 text-sm">
            © {new Date().getFullYear()} Nexus Network. Building the global intelligence infrastructure.
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
