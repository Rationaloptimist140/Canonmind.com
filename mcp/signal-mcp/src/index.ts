#!/usr/bin/env node
// ── SIGNAL-MCP · CanonMind Read-Only MCP Server ──────────────────────────────
// KB: cmqs8ogt107yl07ads5pr3whq · 60 entries sealed · Constant 08 enforced

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import {
  KB, KB_CAP, KB_TABLE_ID, CONSTANT_08, WRITE_REJECT_CODE,
  MUTATION_PATTERNS, INTEGRATE_THRESHOLD, TIMELESSNESS_WEIGHT,
  TIMELESSNESS_TEST, type Medium,
} from "./constants.js";
import { handleListWorks }  from "./handlers/list-works.js";
import { handleGetWork }    from "./handlers/get-work.js";
import { handleOOCScore }   from "./handlers/ooc-score.js";
import { handleGetPath }    from "./handlers/get-path.js";

// ── SERVER INIT ───────────────────────────────────────────────────────────────
const server = new Server(
  {
    name: "signal-mcp",
    version: "1.0.0",
  },
  {
    capabilities: { tools: {} },
  }
);

// ── TOOL REGISTRY ─────────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "canon_list_works",
      description: `List INTEGRATE works from the sealed Canon KB (${KB_TABLE_ID}). ` +
        `${KB.length}/${KB_CAP} entries active. Filter by medium or minimum score.`,
      inputSchema: {
        type: "object",
        properties: {
          medium: {
            type: "string",
            enum: ["all", "film", "music", "literature", "visual-art"],
            description: "Medium filter. Default: all.",
          },
          min_score: {
            type: "number",
            description: `Minimum Canon Score. Default: ${INTEGRATE_THRESHOLD}.`,
          },
          include_rule06: {
            type: "boolean",
            description: "Include Rule 06 specialist-routed works. Default: true.",
          },
        },
      },
    },
    {
      name: "canon_get_work",
      description: "Retrieve full metadata for a specific work by title or creator. " +
        "Returns score, timelessness, maturity routing, Rule 06 status, CCF availability.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Work title or creator name to look up.",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "canon_score_ooc",
      description: `Out-of-Canon rapid assessment. Estimates Canon Score for works NOT in ` +
        `the sealed KB. Returns 6-dimension breakdown, weighted total, classification ` +
        `(CANDIDATE ≥${INTEGRATE_THRESHOLD} | MONITOR | BELOW THRESHOLD), and KB redirect.`,
      inputSchema: {
        type: "object",
        properties: {
          title:   { type: "string" },
          creator: { type: "string" },
          year:    { type: "number" },
          medium:  { type: "string", enum: ["film", "music", "literature", "visual-art"] },
        },
        required: ["title", "creator", "year", "medium"],
      },
    },
    {
      name: "canon_get_path",
      description: "Retrieve a full Learning Path (01–06) with ordered works, rationale, " +
        "maturity guidance, and cross-path references. All works from sealed KB.",
      inputSchema: {
        type: "object",
        properties: {
          path_id: {
            type: "number",
            enum: [1, 2, 3, 4, 5, 6],
            description: "Path number 1–6.",
          },
        },
        required: ["path_id"],
      },
    },
  ],
}));

// ── CONSTANT 08: WRITE REJECTION MIDDLEWARE ───────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = request.params.name.toLowerCase();

  // Hard reject any mutation attempt
  const isMutation = MUTATION_PATTERNS.some(p => tool.includes(p));
  if (isMutation) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      `${WRITE_REJECT_CODE}: ${CONSTANT_08}`,
      {
        code:     WRITE_REJECT_CODE,
        constant: 8,
        kb:       KB_TABLE_ID,
        cap:      KB_CAP,
      }
    );
  }

  // Route to handler
  switch (request.params.name) {
    case "canon_list_works":
      return handleListWorks(request.params.arguments ?? {});
    case "canon_get_work":
      return handleGetWork(request.params.arguments ?? {});
    case "canon_score_ooc":
      return handleOOCScore(request.params.arguments ?? {});
    case "canon_get_path":
      return handleGetPath(request.params.arguments ?? {});
    default:
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}. Available: ` +
        `canon_list_works | canon_get_work | canon_score_ooc | canon_get_path`
      );
  }
});

// ── TRANSPORT ─────────────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
