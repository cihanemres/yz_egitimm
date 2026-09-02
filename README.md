# SözlüAI

Bilişim Teknolojileri ve Yazılım dersi için yapay zeka destekli açık uçlu test ve anında geri bildirim platformu.

## Özellikler

- **Öğretmen Paneli:** Yeni açık uçlu sınavlar oluşturma ve Gemini API ile otomatik soru/rubrik üretimi. Öğrencilerin sonuçlarını detaylı inceleme.
- **Öğrenci Paneli:** Açık uçlu soruları yanıtlama, sınavı bitirdiğinde Gemini API ile otomatik, anında, yapıcı ve detaylı geri bildirim alma.
- **Güvenlik:** NextAuth.js (v5) ile rol bazlı yetkilendirme. Öğrenci sadece kendi sonuçlarını, öğretmen kendi oluşturduğu testleri görür.
- **Performans & Tasarım:** Next.js 14 App Router, Server Actions, Tailwind CSS.

## Teknolojiler

- Next.js 14 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM & PostgreSQL
- NextAuth.js v5 (Auth.js)
- Google Gemini API (`@google/genai`)

## Kurulum ve Çalıştırma

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Çevre Değişkenlerini (Environment Variables) Ayarlayın:**
   `.env.example` dosyasını kopyalayarak kök dizinde `.env` dosyası oluşturun ve bilgilerinizi doldurun.
   ```env
   DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/sozluai"
   GEMINI_API_KEY="AIzaSy..."
   AUTH_SECRET="ornek_rastgele_olusturulmus_gizli_anahtar"
   AUTH_URL="http://localhost:3000"
   ```

3. **Veritabanını Hazırlayın:**
   Prisma şemasını veritabanına uygulayın.
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Örnek Verileri (Seed) Ekleyin:**
   Uygulamanın çalışması için 1 öğretmen, 2 öğrenci ve hazır 1 sınav içeren seed işlemini çalıştırın.
   ```bash
   npx prisma db seed
   ```

5. **Uygulamayı Başlatın:**
   ```bash
   npm run dev
   ```

   Tarayıcınızda `http://localhost:3000` adresine giderek uygulamayı görüntüleyebilirsiniz.
   
   **Test Hesapları:**
   - Öğretmen: `ogretmen@test.com` (Şifre: `123456`)
   - Öğrenci 1: `ogrenci1@test.com` (Şifre: `123456`)
   - Öğrenci 2: `ogrenci2@test.com` (Şifre: `123456`)

## Vercel'e Dağıtım (Deployment)

1. Vercel'de yeni bir proje oluşturun ve GitHub deponuzu bağlayın.
2. Vercel Postgres eklentisini projeye ekleyin (veya Supabase, Neon gibi başka bir Postgres sağlayıcısından aldığınız bağlantıyı kullanın).
3. **Environment Variables** bölümüne Vercel panelinden şu değerleri ekleyin:
   - `DATABASE_URL` (Vercel Postgres eklerseniz otomatik gelir)
   - `GEMINI_API_KEY`
   - `AUTH_SECRET` (Uygulama güvenliği için güçlü bir şifre)
   - `AUTH_URL` (Vercel domaininiz, örn: `https://sozluai.vercel.app`)
4. **Build Command** ayarını şu şekilde güncelleyin:
   ```bash
   prisma generate && next build
   ```
5. Deploy butonuna basın!

## GitHub'a Yükleme

GitHub'a yüklemeden önce `.env` dosyasının depoya gitmemesi için `.gitignore` dosyasında bulunduğuna emin olun.
```bash
git add .
git commit -m "İlk sürüm: SözlüAI platformu"
git push origin main
```
