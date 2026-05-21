# Research: AI Agents Pipeline Implementation

## Decision: Agent Framework Selection

**Decision**: Use LangChain v1.2 `create_agent` for Security Check Agent and `create_deep_agent` for SEO Generator Agent.

**Rationale**:

- Security agent is simple (boolean output) — `create_agent` is sufficient and lighter
- SEO agent needs planning, research tool delegation, and deep analysis — `create_deep_agent` provides built-in planning (`write_todos`), subagent delegation, filesystem tools, and context management
- Both use the same model configuration pattern via `init_chat_model`

**Alternatives considered**:

- `create_deep_agent` for both: Overkill for the simple boolean security check
- Custom LangGraph graphs: More control but significantly more code; deep agents provides needed capabilities out of the box
- Claude Agent SDK: Would require changing model provider from Gemini

## Decision: Gemini Video Analysis Approach

**Decision**: Use Gemini Files API (`google-genai` client's `client.files.upload()`) to upload videos and get a file ID reference, then pass that file reference to `generate_content()` calls for analysis.

**Rationale**:

- Files API is designed for files >100MB (or any video that shouldn't be base64-encoded inline)
- File IDs persist for ~48 hours, sufficient for pipeline processing
- Existing codebase already uploads to Gemini Files API; extend this pattern for analysis
- LangChain's `ChatGoogleGenerativeAI` supports multimodal content blocks including file references

**Alternatives considered**:

- Base64 encoding inline: Limited to smaller files; increases memory usage; not suitable for Railway's 0.5GB RAM
- Direct video URL: Gemini cannot access external URLs directly; must use Files API or base64

## Decision: Model Selection

**Decision**: Use `gemini-2.5-flash-lite` for security check (fast, cost-effective) and `gemini-2.5-flash` or `gemini-3.1-pro-preview` for SEO generation (higher quality for creative metadata).

**Rationale**:

- Security check is a classification task — flash-lite is sufficient and faster
- SEO generation requires creative, nuanced output — higher-capability model produces better titles, descriptions, and viral scores
- Both models support multimodal video input via Files API

**Alternatives considered**:

- Single model for both: Simpler but either overpaying for security check or underperforming on SEO
- Gemini 2.0 Flash: Older model; 3.1 series has better video understanding

## Decision: Pipeline Execution Pattern

**Decision**: Async initiation endpoint returns immediately with pipeline ID. Next.js frontend polls a `/api/pipeline/status/{videoId}` endpoint every 5 seconds. Pipeline state stored in MongoDB with fields: `status`, `current_stage`, `progress_percentage`, `security_result`, `seo_result`, `error`, `updated_at`.

**Rationale**:

- Matches AGENTS.md constraint: "Every API response should complete within 10 seconds"
- AGENTS.md explicitly suggests: "implement a polling mechanism or asynchronous processing with status updates"
- MongoDB persistence enables users to navigate away and return without losing progress
- Simple polling is easier to implement than SSE/WebSockets and works within Vercel serverless constraints

**Alternatives considered**:

- SSE (Server-Sent Events): Better real-time but harder to implement with Vercel serverless timeout limits
- WebSockets: Overkill for this use case; Railway free tier may not support persistent connections well
- Python backend callbacks to Next.js: Adds complexity; polling is simpler and more reliable

## Decision: Research Tool Implementation

**Decision**: SEO agent uses a `@tool` decorated function that performs web searches via a lightweight HTTP request to a search API (e.g., Google Custom Search API or Tavily). The agent autonomously decides when to call it based on content analysis.

**Rationale**:

- LangChain's `@tool` decorator makes the tool available to the agent with automatic prompt inclusion
- Deep agents can autonomously decide when to use tools based on the task
- Web research provides current, niche-specific data for better SEO metadata

**Alternatives considered**:

- Subagent for research: Deep agents can spawn subagents, but a simple tool is lighter for Railway's 0.5GB RAM
- Pre-built LangChain web search tools (Tavily, DuckDuckGo): Tavily requires additional dependency; custom tool gives more control
- No research: Would produce less relevant metadata; research is explicitly requested

## Decision: YouTube Category Resolution

**Decision**: Tool that calls YouTube Data API v3 `videoCategories.list` endpoint to fetch latest categories, then the agent selects the best match based on video content analysis.

**Rationale**:

- YouTube API provides authoritative, up-to-date category list
- Agent can make intelligent matching decisions between video content and available categories
- Simple HTTP call; no heavy dependencies needed

**Alternatives considered**:

- Hardcoded category list: Becomes stale; YouTube may add/remove categories
- Agent guesses category: Less accurate; YouTube API provides ground truth

## Decision: Security Check Agent Output

**Decision**: Single boolean value (true/false). No detailed breakdown, no violation categories, no timestamps.

**Rationale**:

- Spec explicitly states: "outputs a single boolean value"
- Simplifies agent prompt and output parsing
- Reduces processing time for the first pipeline gate

## Decision: Viral Score Format

**Decision**: Percentage (0-100%) representing probability of content going viral after SEO optimizations.

**Rationale**:

- Clarification session confirmed this format
- Intuitive for users to understand
- Easy to display visually in UI
