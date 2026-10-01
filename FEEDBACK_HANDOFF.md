# Research Starter Lab — Feedback 部署交接

代码位于 `Dellin3/student-research-lab`，发布分支为 `codex/research-lab-feedback-20261001`，基于 `79f916a`。目标是现有网站 `https://student-research-lab-theta.vercel.app/`。用户已确认预览，并于 2026-10-01 授权部署。

## 界面

- 顶部导航最右侧增加普通文字链接 Feedback，位于 My research / Sign in 后。
- 独立 `/feedback` 页面只保留原地球背景与一个深色矩形表单，不显示首页文案、导航或页脚。
- 姓名、邮箱、问题类型、问题内容四项必填。无需注册或登录。
- 固定收件人：`Zhuoxuan780123@gmail.com`。主题和通知正文明确标记 Research Starter Lab。
- 现有账号、Google 登录、学生研究记录及 Supabase 配置保持原样。

## 上线

1. 将已确认的反馈改动合入最新仓库版本，保留此后新增的改动。Vercel 项目为 `delling/student-research-lab`；核对项目实际绑定的上述正式域名，避免操作 PRIMES 项目。
2. 为这个 Vercel 项目连接 **Private Vercel Blob**，配置服务端变量 `BLOB_READ_WRITE_TOKEN`、`RESEND_API_KEY`、`FEEDBACK_FROM_EMAIL`。不要给这些变量加 `VITE_` 前缀，也不要将密钥提交到 GitHub。
3. Resend 发件地址使用已验证域名；不要把访客的邮箱当作发件人或收件人。访客邮箱仅用于 Reply-To。若复用已有邮件服务，确认凭据权限允许这个项目发送；不要假设另一个项目的环境变量会自动复制。
4. 部署完整源码，保留 `api/feedback.js` 和 `server/`。仅上传 `dist` 不会包含收件服务。`/feedback` 对应的 HTML 会随构建预渲染。
5. 运行 `npm ci`、`npm run lint`、`npm run build`、`npm run check:seo`、`npm run check:prerender`、`npm run check:internal-links`、`npm run check:feedback`。
6. 浏览器检查顶部入口、手机菜单、四项输入、直接打开和刷新 `/feedback`、失败时保留文字；账户和 My research 仍可正常使用。
7. 上线后检查 `GET /api/feedback` 返回 `enabled: true`。这只代表配置齐全；由用户提交一条明确标注的测试，再核对私有保存记录和邮箱实际收件。

## 验证边界

本地 API 测试使用模拟存储和邮件发送，不会发送真实邮件。接收端未配置时，直接提交按钮不可用，页面提供包含已填内容的邮箱草稿链接；不能显示虚假的提交成功。

服务端先私有保存，再请求邮件通知。通知失败时记录仍保留；`notificationSent: true` 表示邮件服务接受请求，不代表已进入收件箱。反馈没有公开查询接口；维护者可在私有 Blob 中查看。浏览器现有研究记录、账号信息不会自动填入或附加到反馈。
