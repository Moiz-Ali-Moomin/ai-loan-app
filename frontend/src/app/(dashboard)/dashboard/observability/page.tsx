'use client';

const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL ?? 'http://localhost:3100';
const TEMPORAL_UI_URL = process.env.NEXT_PUBLIC_TEMPORAL_UI_URL ?? 'http://localhost:8088';
const KAFKA_UI_URL = process.env.NEXT_PUBLIC_KAFKA_UI_URL ?? 'http://localhost:8090';
const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL ?? 'http://localhost:9001';
const OPA_URL = process.env.NEXT_PUBLIC_OPA_URL ?? 'http://localhost:8181';
const PROMETHEUS_URL = process.env.NEXT_PUBLIC_PROMETHEUS_URL ?? 'http://localhost:9091';

const tools = [
  { name: 'Grafana Dashboards', description: 'Metrics, traces, and logs via LGTM stack', href: GRAFANA_URL, color: 'orange' },
  { name: 'Temporal UI', description: 'Workflow history, replays, and state inspection', href: TEMPORAL_UI_URL, color: 'blue' },
  { name: 'Kafka UI', description: 'Topic browser, consumer groups, message inspector', href: KAFKA_UI_URL, color: 'green' },
  { name: 'MinIO Console', description: 'AI prompts, responses, and compliance artifacts', href: MINIO_URL, color: 'purple' },
  { name: 'OPA Playground', description: 'Policy evaluation and debugging', href: OPA_URL, color: 'teal' },
  { name: 'Prometheus', description: 'Raw metrics and alerting rules', href: PROMETHEUS_URL, color: 'red' },
];

const colorMap: Record<string, string> = {
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  teal: 'bg-teal-50 border-teal-200 text-teal-700',
  red: 'bg-red-50 border-red-200 text-red-700',
};

export default function ObservabilityPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Observability</h1>
        <p className="text-slate-500 mt-1">Access all monitoring and inspection tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tools.map(({ name, description, href, color }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`block border rounded-xl p-6 hover:shadow-md transition-shadow ${colorMap[color]}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{name}</h3>
              <span className="text-lg">↗</span>
            </div>
            <p className="text-sm opacity-80">{description}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Architecture Overview</h2>
        <pre className="bg-slate-50 rounded-lg p-4 text-xs text-slate-600 overflow-auto leading-relaxed">{`
  ┌─────────────────────────────────────────────────────────────┐
  │                  AI Loan Governance Platform                 │
  │                                                             │
  │  Client → API Gateway (Fastify + JWT + Rate Limit)          │
  │               │                                             │
  │               ├─→ Temporal Worker (Workflow Orchestration)  │
  │               │        │                                    │
  │               │        ├─→ Policy Service (OPA)             │
  │               │        ├─→ AI Execution (LLM + Prompts)     │
  │               │        ├─→ Audit Service (Immutable Log)    │
  │               │        └─→ MinIO (Artifacts)                │
  │               │                                             │
  │               └─→ PostgreSQL (Partitioned Audit Logs)       │
  │                                                             │
  │  Kafka Topics: loan.requests | workflow.events              │
  │               policy.events | ai.decisions | audit.events   │
  │                    │                                        │
  │               Event Consumer → Redis Cache                  │
  │                                                             │
  │  Observability: OTel → LGTM (Loki+Grafana+Tempo+Prometheus) │
  └─────────────────────────────────────────────────────────────┘
        `}</pre>
      </div>
    </div>
  );
}
