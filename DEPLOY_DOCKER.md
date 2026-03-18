# UniClaudeProxy Docker Compose 部署说明

## 1. 准备配置文件

先复制配置模板：

```bash
cp config.example.json config.json
```

在 `config.json` 里至少处理这几项：

1. 填入你实际要用的上游 `api_key`
2. 把 `models` 改成你自己的模型映射
3. VPS 上通过 Docker 对外提供服务时，`server` 建议改成：

```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 9223,
    "local_only": false
  }
}
```

原因：这个项目默认只允许 localhost 访问。容器发布端口后，请求来源会是 Docker 网桥或反代容器 IP，`local_only: true` 会直接返回 `403`。

如果你启用了 `save_and_ref` 图片模式，建议给对应模型显式设置：

```json
{
  "image_mode": "save_and_ref",
  "image_dir": "/app/data/images"
}
```

这样图片会落在宿主机的 `./data/images`。

## 2. 启动服务

```bash
docker compose up -d --build
```

查看状态：

```bash
docker compose ps
docker compose logs -f uniclaudeproxy
```

## 3. 验证健康检查

```bash
curl http://127.0.0.1:9223/health
```

预期返回：

```json
{"status":"ok"}
```

如果你在本机之外访问，把 `127.0.0.1` 换成 VPS 的实际 IP 或域名。

## 4. Claude Code 连接方式

把 Claude Code 的 `ANTHROPIC_BASE_URL` 指到你的 VPS：

```json
{
  "ANTHROPIC_BASE_URL": "http://你的VPSIP:9223"
}
```

如果前面挂了反向代理或 HTTPS，就改成对应域名地址。

## 5. 安全建议

这个项目不会校验 Anthropic token，本质上是谁能访问你的代理，谁就能消耗你上游模型的额度。

VPS 部署至少做一层限制：

1. 只在防火墙放行你自己的出口 IP
2. 或者前面挂 Nginx / Caddy 做 Basic Auth 或 Access Control
3. 或者不要直接暴露公网端口，只通过 Tailscale / WireGuard / SSH 隧道访问

如果你只是自己单机使用，第三种最稳。
