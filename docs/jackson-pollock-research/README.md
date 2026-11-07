# پروندهٔ پژوهشی جکسون پولاک

سند PDF نهایی در ریشهٔ مخزن قرار دارد: `jackson-pollock-research.pdf` (۱۴ صفحه، A4، فارسی).

## ساختار

| فایل | توضیح |
|---|---|
| `index.html` | منبعِ سند (HTML/CSS چاپی، راست‌به‌چپ) |
| `fonts/` | قلم وزیرمتن (وزن‌های ۴۰۰، ۵۰۰، ۷۰۰، ۹۰۰) — برای یکدستیِ رندر لازم است |

## بازتولید PDF

HTML را با یک مرورگر Headless کروم به PDF تبدیل می‌کنیم (شکل‌دهی و راست‌به‌چپِ فارسی در کروم درست انجام می‌شود، برخلاف بیشتر کتابخانه‌های PDF):

```sh
# یک ایميج موقت با کروم و وابستگی‌هایش
docker build -t pdfrender - <<'EOF'
FROM node:22
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2 \
    libpango-1.0-0 libcairo2 libglib2.0-0 fonts-dejavu-core fonts-liberation \
 && rm -rf /var/lib/apt/lists/*
EOF
```

سپس با `puppeteer` و تنظیم `PUPPETEER_CACHE_DIR`، فایل `index.html` را با `page.pdf({ format: 'A4', printBackground: true })` رندر کنید (حاشیه‌ها: ۱۴/۱۶/۱۵ میلی‌متر).

## نکتهٔ طراحی

- حاشیهٔ صفحه در چاپ سفید می‌ماند؛ بنابراین «کاغذ» سفید است و بژِ گرم فقط برای کارت‌ها، جدول‌ها و کادرهای تأکید استفاده شده تا لبهٔ صفحه دو‌رنگ نشود.
- اعداد بازار در سند تقریبی‌اند و بر گزارش‌های رسانه‌ای تکیه دارند (در پایان سند یادداشت روش آمده است).
