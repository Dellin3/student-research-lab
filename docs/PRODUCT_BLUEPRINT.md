# Product Blueprint

Research Starter Lab is an interactive research-learning environment for students in mathematics, physics, computer science, biology, environmental science, and social science.

## Journey

Curiosity → direction → literature → question → smallest feasible investigation → evidence → revision → communication.

## Product modes

- **Learn:** calm editorial guidance with worked examples.
- **Build:** precise tools where the current action dominates.
- **See:** examples and state changes make research reasoning visible.
- **Record:** a local, evolving account of the student's thinking.

## Core loop

Each major path should help the student see a concept, try it, understand the result, explicitly save useful work, and continue.

## Information architecture

- **Start:** orientation and first useful action.
- **Learn:** direction, workflow, literature, project building, outreach.
- **Tools:** Topic Narrowing Lab, Question Builder, Investigation Planner, and Research Record.
- **Examples:** balanced worked examples plus one real Saturn physics example.
- **Research Record:** the student's local structured notebook at `/worksheet`.

Existing deep URLs remain stable. `/learn` and `/tools` are crawlable hubs. `/investigation-planner` turns a question into a mode-aware first investigation without certifying feasibility or quality.

## Research honesty

Deterministic diagnostics describe visible structure only. Human review is always required for scientific meaning, feasibility, prior work, ethics/safety, relevance, clarity, and challengeability.

## Local-first record

The canonical key remains `research-starter-worksheet`. Legacy fields are migrated into a versioned record without deleting unknown data. Cross-tool imports are explicit and never silently replace an existing question. Structured plans, source and evidence logs, revision history, and mentor briefs stay local. JSON import validates the backup and requires an explicit merge or replacement choice; JSON, Markdown, and print exports keep browser-only work portable.

## Delivery architecture

The accepted React/Vite static-prerender architecture remains route-correct and hydration-safe. Routes currently share one client bundle; route-level lazy loading was not introduced because React `renderToString` and lazy route boundaries would add prerender/hydration risk for a modest bundle reduction. Revisit only with an SSR-compatible chunk-preload design.
