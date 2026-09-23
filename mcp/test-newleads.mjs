// Test get_new_leads_since_last_check (safe, read-only on Supabase).
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const t = new StreamableHTTPClientTransport(new URL(process.env.MCP_URL || 'http://127.0.0.1:3001/mcp'));
const c = new Client({ name: 'test-newleads', version: '1.0.0' });
await c.connect(t);
const r = await c.callTool({ name: 'get_new_leads_since_last_check', arguments: {} });
console.log(r.content[0].text.replace(/\n/g, ' | '));
await c.close();
