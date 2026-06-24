# signal-mcp

**CanonMind Read-Only MCP Server** · 60-entry sealed Canon KB

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes the CanonMind Core Canon Seed List to LLM agents and developer environments. Constant 08 is enforced in software: all write and mutation operations return an immutable rejection code.

## Knowledge Base

- **Table ID:** `cmqs8ogt107yl07ads5pr3whq`
- **Entries:** 60 active INTEGRATE works (sealed at Phase 05 Batch 005)
- **Mediums:** Film (18) · Music (15) · Literature (16) · Visual Art (11)
- **Highest score:** The Metamorphosis (Kafka, 1915) — **9.9/10**

## Installation

```bash
npm install signal-mcp
# or
npx signal-mcp
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "signal-mcp": {
      "command": "npx",
      "args": ["signal-mcp"]
    }
  }
}
```

## Usage with Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "signal-mcp": {
      "command": "npx",
      "args": ["signal-mcp"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `canon_list_works` | List all 60 INTEGRATE works. Filter by medium or minimum score. |
| `canon_get_work` | Full metadata for a work by title or creator. |
| `canon_score_ooc` | Out-of-Canon rapid assessment — works NOT in the KB. |
| `canon_get_path` | Full Learning Path (01–06) with ordered works and rationale. |

## Constant 08 — Write Rejection

Any tool name matching a mutation pattern (`add_work`, `delete_work`, `update_work`, `insert_work`, `mutate_work`, `patch_work`, `override_verdict`, etc.) returns:

```
ErrorCode.InvalidRequest: CANON_WRITE_REJECTED
"Constant 08: The KB is sealed at 60/60. Write and mutation operations 
are architecturally prohibited. All integrations pass through formal 
CanonGuardian batch review before entry."
```

## Example Queries

```
"List all films in the canon with a score above 9.3"
→ canon_list_works({ medium: "film", min_score: 9.3 })

"Tell me about Winterreise"
→ canon_get_work({ query: "Winterreise" })

"Should I watch Dune: Part Two?"
→ canon_score_ooc({ title: "Dune: Part Two", creator: "Denis Villeneuve", year: 2024, medium: "film" })

"Build me a curriculum on memory and time"
→ canon_get_path({ path_id: 1 })
```

## Repository

**GitHub:** [Rationaloptimist140/Canonmind.com](https://github.com/Rationaloptimist140/Canonmind.com)  
**Domain:** [canonmind.com](https://canonmind.com)  
**Manual:** [canonmind.com/manual](https://canonmind.com/manual)

---

*Phase 07 · Profile CJzZqVhg · canonmind.com*
