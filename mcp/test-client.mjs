// Quick end-to-end test of the MCP server over streamable-http.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const URL_ = process.env.MCP_URL || 'http://127.0.0.1:3001/mcp';
const transport = new StreamableHTTPClientTransport(new URL(URL_));
const client = new Client({ name: 'test-client', version: '1.0.0' });
await client.connect(transport);

const tools = await client.listTools();
console.log('TOOLS:', tools.tools.map(t => t.name).join(', '));

const stats = await client.callTool({ name: 'crm_stats', arguments: { period: 'all' } });
console.log('crm_stats →', stats.content[0].text.replace(/\n/g, ' | '));

const note = await client.callTool({ name: 'add_note', arguments: { title: '[TEST] MCP note', content: 'ghi chú test từ MCP' } });
console.log('add_note →', note.content[0].text);

// update_hero: change then restore original
const up = await client.callTool({ name: 'update_hero', arguments: { new_title: 'FLASH SALE TEST 30%' } });
console.log('update_hero →', up.content[0].text.replace(/\n/g, ' | '));
const oldTitle = up.content[0].text.match(/Cũ: "([^"]*)"/)?.[1];
if (oldTitle) {
  const back = await client.callTool({ name: 'update_hero', arguments: { new_title: oldTitle } });
  console.log('restore hero →', back.content[0].text.replace(/\n/g, ' | '));
}

await client.close();
console.log('ALL OK');
