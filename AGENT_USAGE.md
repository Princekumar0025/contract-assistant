# Agent Usage

## Tools Used
- `run_command`: Used to execute terminal commands (e.g., initializing Next.js, installing dependencies, running database migrations).
- `write_to_file`: Used to scaffold source code, configurations, `.env` templates, Prisma schemas, and documentation.
- `list_dir` / `manage_task`: Used to inspect the workspace and manage background CLI operations.

## Representative Prompts
The application relies on structured LLM extractions (e.g., using `generateObject` from Vercel AI SDK or direct Gemini API with structured outputs). The prompt is designed to instruct the model to analyze a contract text and return structured JSON defining parties, key clauses (expiry, renewal, termination, notice), obligations (with deadlines and responsible parties), and clarification questions.

A core prompt segment used:
> "You are an expert contract analyst assistant. Your role is strictly informational; you do not provide legal advice. Extract the following from the provided contract text: Parties, Effective Date, Expiry Date, Clauses (Expiry, Renewal, Termination, Notice), Obligations, and Clarifications for ambiguous terms. Every extracted clause and obligation must cite its exact source section. Distinguish confirmed facts from uncertain interpretations."

## Delegated Work
- The AI agent (myself, Antigravity) handled the entire backend setup, Next.js scaffolding, UI component creation, database schema design, and integration with the LLM API.
- The human (user) is expected to provide their actual API keys (`GEMINI_API_KEY`) and interact with the deployed UI.

## Important Mistakes or Rejected Suggestions
- In earlier plans, standard Next.js styling with Tailwind was considered, but per strict rules, Vanilla CSS/CSS Modules were favored where explicitly required, though Next.js `app` router templates prefer global CSS which I integrated cleanly.
- Over-automating legal decisions was avoided per the prompt's strict instruction to present the app as an "information-management tool". The AI does not make legal assertions.

## Output Verification
- The output was verified by running local Next.js dev server builds, checking Next.js API routes with mocked payloads, and running Prisma Studio to confirm the SQLite database handles relationships (Contracts -> Clauses/Obligations) correctly. Focus was on ensuring the user review states (Pending Review vs Approved) track correctly.
