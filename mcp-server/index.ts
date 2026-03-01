#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { Request, Response } from 'express';
import { MultiLinguaClient } from './client';
import { registerTools } from './tools';
import { registerResources } from './resources';

const VERSION = '0.1.0';

// One shared client instance — loaded from env / ~/.multi-lingua-mcp.json once at startup.
const globalClient = new MultiLinguaClient();

function createServer(): McpServer {
  const server = new McpServer({
    name: 'multi-lingua',
    version: VERSION,
  });
  registerTools(server, globalClient);
  registerResources(server, globalClient);
  return server;
}

async function runStdio(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // All log output goes to stderr so it does not corrupt the stdio MCP protocol stream.
  process.stderr.write('[multi-lingua-mcp] running on stdio transport\n');
}

async function runHttp(port: number): Promise<void> {
  const app = express();
  app.use(express.json());

  const handleMcpRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      const server = createServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on('close', () => { transport.close(); });
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  // Streamable HTTP uses POST for JSON-RPC requests and GET for SSE notification streams.
  app.post('/mcp', handleMcpRequest);
  app.get('/mcp', handleMcpRequest);

  // Simple health / discovery endpoint.
  app.get('/', (_req, res) => {
    res.json({
      name: 'multi-lingua-mcp',
      version: VERSION,
      transport: 'streamable-http',
      endpoint: '/mcp',
    });
  });

  app.listen(port, () => {
    process.stderr.write(`[multi-lingua-mcp] HTTP transport listening on http://localhost:${port}/mcp\n`);
  });
}

async function main(): Promise<void> {
  const transportMode = (process.env.MCP_TRANSPORT || 'stdio').toLowerCase();
  const port = parseInt(process.env.MCP_PORT || '3457', 10);

  if (transportMode === 'http' || transportMode === 'streamable-http') {
    await runHttp(port);
  } else {
    await runStdio();
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[multi-lingua-mcp] fatal: ${message}\n`);
  process.exit(1);
});
