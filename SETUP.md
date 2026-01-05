# E-NG Bot - Setup Instructions for Vercel

## 1. Cấu hình Environment Variables trên Vercel

Vào **Project Settings** → **Environment Variables** và thêm các biến sau:

```
BOT_TOKEN=your_telegram_bot_token_from_botfather
API_BASE_URL=https://dev-taskify.taskhub.company
```

**Lưu ý:** Sau khi thêm biến môi trường, bạn PHẢI **Redeploy** project để biến có hiệu lực.

## 2. Thiết lập Webhook cho Telegram Bot

Sau khi deploy lên Vercel thành công, bạn cần set webhook URL cho bot.

### Cách 1: Dùng trình duyệt

Mở URL sau trên trình duyệt (thay `YOUR_BOT_TOKEN` và `YOUR_VERCEL_DOMAIN`):

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_VERCEL_DOMAIN/api/webhook
```

Ví dụ:
```
https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/setWebhook?url=https://bot-taskify.vercel.app/api/webhook
```

### Cách 2: Dùng curl

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -d "url=https://YOUR_VERCEL_DOMAIN/api/webhook"
```

### Kiểm tra webhook đã set chưa

```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

Bạn sẽ thấy kết quả như:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.vercel.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## 3. Kiểm tra Bot

1. Mở Telegram, tìm bot của bạn
2. Gửi `/start`
3. Bot sẽ trả lời với thông báo đăng nhập

## 4. Debug (nếu bot không trả lời)

### Kiểm tra logs trên Vercel:
1. Vào Vercel Dashboard
2. Chọn project → **Deployments** → Click vào deployment mới nhất
3. Chọn tab **Functions** → Chọn `api/webhook`
4. Xem **Logs** để thấy các dòng log (bắt đầu bằng `LOG:` hoặc `CRITICAL:`)

### Kiểm tra Telegram webhook status:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

Nếu `last_error_message` có lỗi, hãy kiểm tra lại:
- URL webhook có đúng không (phải có `/api/webhook`)
- Environment variables đã set chưa
- Đã redeploy sau khi thêm biến môi trường chưa

## 5. Lưu ý quan trọng về Session Storage

Bot hiện tại lưu session (trạng thái đăng nhập) trong **RAM**. 

Trên Vercel Serverless, RAM sẽ bị reset sau mỗi request hoặc sau vài phút không hoạt động.

**Hậu quả:** Bạn sẽ phải đăng nhập lại liên tục.

**Giải pháp lâu dài:** Cần tích hợp database như Redis hoặc MongoDB để lưu session bền vững.

## 6. Chạy Local (Development)

```bash
npm install
npm run dev
```

Bot sẽ chạy ở chế độ polling (không cần webhook).
