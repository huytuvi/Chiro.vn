// Test only crm_stats (safe, read-only).
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const transport = new StreamableHTTPClientTransport(new URL(process.env.MCP_URL || 'http://127.0.0.1:3001/mcp'));
const client = new Client({ name: 'test-crm', version: '1.0.0' });
await client.connect(transport);
const all = await client.callTool({ name: 'crm_stats', arguments: { period: 'all' } });
console.log('crm_stats(all)  →', all.content[0].text.replace(/\n/g, ' | '));
const today = await client.callTool({ name: 'crm_stats', arguments: { period: 'today' } });
console.log('crm_stats(today)→', today.content[0].text.replace(/\n/g, ' | '));
await client.close();
