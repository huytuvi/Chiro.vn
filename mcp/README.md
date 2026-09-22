# MCP Server — chiro.vn

Cho AI agent (goClaw) "cánh tay" thao tác trực tiếp lên website + `brain.db`.

- **Transport:** streamable-http (stateless)
- **Địa chỉ:** `http://127.0.0.1:3001/mcp` (chỉ localhost — goClaw cùng VPS gọi vào)
- **Dùng chung** `brain.db` và `public/index.html` với website (không tạo DB mới)

## Tools
| Tool | Input | Việc |
|------|-------|------|
| `update_hero` | `new_title` | Đổi tiêu đề hero (`#hero-headline`) trong `public/index.html` |
| `crm_stats` | `period` (`today`\|`all`) | Đếm khách / đơn / đơn đã thanh toán / doanh thu |
| `add_note` | `title`, `content` | Lưu ghi chú vào bảng `knowledge` của `brain.db` |

## Chạy local (test)
```bash
cd ..              # về thư mục gốc repo
npm install        # cài @modelcontextprotocol/sdk, zod (dùng chung node_modules)
node mcp/server.js # MCP chạy ở 127.0.0.1:3001
curl http://127.0.0.1:3001/health
```

## Deploy trên VPS (systemd)
```bash
cd /var/www/chiro
git pull                 # hoặc rsync code mới
npm install              # cài dependency MCP
```

Tạo `/etc/systemd/system/mcp-server.service`:
```ini
[Unit]
Description=chiro.vn MCP server (goClaw tools)
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/chiro
ExecStart=/usr/bin/node /var/www/chiro/mcp/server.js
Environment=MCP_PORT=3001
Environment=MCP_HOST=127.0.0.1
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable --now mcp-server
systemctl status mcp-server
curl http://127.0.0.1:3001/health
```

## Kết nối vào goClaw Dashboard
- **Capabilities → MCP Servers → Add**
- Name: `my-business` · Transport: `streamable-http`
- URL: `http://127.0.0.1:3001/mcp`
- Tool prefix: `biz` → tool sẽ là `biz__update_hero`, `biz__crm_stats`, `biz__add_note`
- Enabled ✓ → Save
