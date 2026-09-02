# SözlüAI

**Bilişim Teknolojileri ve Yazılım** dersi için yapay zeka destekli açık uçlu test ve geri bildirim platformu.

Öğretmenler açık uçlu sorular ve puanlama rubrikleri hazırlar (isterse Gemini'ye ürettirir); öğrenciler testi çözer, yanıtları rubriğe göre yapay zeka tarafından anında puanlanır ve her soru için gerekçeli geri bildirim, güçlü yönler ve geliştirilecek yönler sunulur.

---

## Teknoloji yığını

| Katman           | Teknoloji                                        |
| ---------------- | ------------------------------------------------ |
| Çatı             | Next.js 14 (App Router) + TypeScript             |
| Arayüz           | Tailwind CSS                                     |
| Veritabanı       | PostgreSQL + Prisma ORM                          |
| Kimlik doğrulama | NextAuth.js v5 (Auth.js), Credentials + bcryptjs |
| Yapay zeka       | Google Gemini (`gemini-2.5-flash`)               |
| Dağıtım          | Vercel                                           |

---

## Roller

- **TEACHER (Öğretmen):** Kendi testlerini oluşturur, Gemini ile soru ürettirebilir, testi yayınlar ve öğrencilerinin sonuçlarını tablo halinde görür.
- **STUDENT (Öğrenci):** Yayınlanmış testlere girer, tüm soruları tek sayfada yanıtlar, testi bitirdiğinde anında puan ve geri bildirim alır.

Rol, kayıt formunda seçilir.

---

## 1. Kurulum

### Gereksinimler

- Node.js 18.18 veya üzeri
- Bir PostgreSQL veritabanı (Prisma Postgres, Vercel Postgres, Neon, Supabase vb.)
- Google Gemini API anahtarı — <https://aistudio.google.com/app/apikey>

### Adımlar

```bash
# 1) Bağımlılıkları kur
npm install

# 2) Ortam değişkenleri dosyasını oluştur
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

`.env` dosyasını açıp değerleri doldurun (aşağıdaki tabloya bakın).

```bash
# 3) Veritabanı şemasını oluştur (migration ile)
npx prisma migrate dev --name init

# 4) Hazır verileri (öğretmen, öğrenciler ve örnek test) yükle
npx prisma db seed

# 5) Geliştirme sunucusunu başlat
npm run dev
```

Uygulama <http://localhost:3000> adresinde çalışır.

> **Not:** Migration dosyası oluşturmak istemiyorsanız (örn. hızlı prototip) `npx prisma migrate dev` yerine `npx prisma db push` de kullanabilirsiniz.

---

## 2. Ortam değişkenleri

`.env` dosyasında tanımlanır. Örnek için `.env.example` dosyasına bakın.

| Değişken         | Açıklama                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `DATABASE_URL`   | PostgreSQL bağlantı adresi. Örn. `postgresql://kullanici:sifre@host:5432/db?sslmode=require` |
| `GEMINI_API_KEY` | Google Gemini API anahtarı. **Yalnızca sunucu tarafında okunur, istemciye gönderilmez.**     |
| `AUTH_SECRET`    | NextAuth oturum şifreleme anahtarı. Üretimi için aşağıya bakın.                              |
| `AUTH_URL`       | Uygulamanın tam adresi. Yerelde `http://localhost:3000`                                      |

**`AUTH_SECRET` üretme** (hiçbir paket kurmadan, Node ile):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> Alternatif olarak `npx auth secret` de kullanılabilir; ancak npx önbelleği bozuksa
> `ERR_MODULE_NOT_FOUND` hatası verebilir. Bu durumda `npm cache clean --force` çalıştırın
> ya da yukarıdaki Node komutunu tercih edin.

> `.env` dosyası `.gitignore` içindedir ve **asla** depoya gönderilmemelidir.
> Gerçek anahtarlarınızı `.env.example` dosyasına **yazmayın** — o dosya depoya gider.

---

## 3. Demo hesapları

`npx prisma db seed` komutu aşağıdaki hesapları ve **"Algoritma ve Problem Çözme"** adlı yayınlanmış testi (4 açık uçlu soru, her biri 10 puan) oluşturur.

| Rol      | E-posta             | Şifre    |
| -------- | ------------------- | -------- |
| Öğretmen | ogretmen@test.com   | `123456` |
| Öğrenci  | ogrenci1@test.com   | `123456` |
| Öğrenci  | ogrenci2@test.com   | `123456` |

---

## 4. Kullanılabilir komutlar

| Komut               | Açıklama                                            |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Geliştirme sunucusunu başlatır                       |
| `npm run build`     | `prisma generate` + `next build` (Vercel build adımı) |
| `npm start`         | Üretim sunucusunu başlatır                           |
| `npm run db:push`   | Şemayı migration üretmeden veritabanına uygular       |
| `npm run db:seed`   | Hazır verileri yükler                                 |
| `npm run db:studio` | Prisma Studio arayüzünü açar                          |

---

## 5. Sayfa yapısı

| Rota                     | Erişim   | Açıklama                                                      |
| ------------------------ | -------- | ------------------------------------------------------------- |
| `/`                      | Herkes   | Tanıtım sayfası                                                |
| `/register`              | Herkes   | Ad, e-posta, şifre ve rol ile kayıt                             |
| `/login`                 | Herkes   | Giriş; role göre panele yönlendirir                             |
| `/teacher`               | TEACHER  | Test listesi, yayınlama/kaldırma, yeni test                     |
| `/teacher/exams/new`     | TEACHER  | Test oluşturma, Gemini ile soru üretme                          |
| `/teacher/exams/[id]`    | TEACHER  | Sorular, rubrikler ve öğrenci sonuç tablosu                     |
| `/student`               | STUDENT  | Yayındaki testler ve önceki denemeler                           |
| `/student/exams/[id]`    | STUDENT  | Klasik test sayfası, tek gönderimde değerlendirme               |
| `/student/attempts/[id]` | Öğrenci* | Sonuç sayfası (*testin öğretmeni de görebilir)                  |
| `/forbidden`             | —        | Rol uyuşmazlığında gösterilen 403 sayfası                       |

---

## 6. Güvenlik notları

- `middleware.ts`, `/teacher/*` ve `/student/*` rotalarını korur; rol uyuşmazlığında 403 sayfası gösterilir.
- Rol denetimi ayrıca sunucu bileşenlerinde (`lib/yetki.ts`) ve her Server Action içinde yeniden yapılır.
- Öğrenci yalnızca kendi denemelerini, öğretmen yalnızca kendi testlerini ve o testlere ait denemeleri görebilir.
- Tüm Server Action girdileri **Zod** ile doğrulanır.
- Şifreler `bcryptjs` ile hash'lenerek saklanır.
- `GEMINI_API_KEY` yalnızca sunucu tarafında (`lib/gemini.ts`, `server-only` ile işaretli) okunur; istemci paketine hiçbir zaman dahil edilmez.

---

## 7. GitHub'a gönderme

```bash
git init
git add .
git commit -m "SözlüAI ilk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/sozlu-ai.git
git push -u origin main
```

`.env` dosyası `.gitignore` içinde olduğu için gönderilmez. Depoya yalnızca `.env.example` gider.

---

## 8. Vercel'e dağıtım

1. <https://vercel.com/new> adresinden GitHub deponuzu içe aktarın.
2. **Environment Variables** bölümüne şu değişkenleri ekleyin:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `AUTH_SECRET`
   - `AUTH_URL` → dağıtım adresiniz, örn. `https://sozlu-ai.vercel.app`
3. Build komutu `package.json` içinde zaten `prisma generate && next build` olarak tanımlıdır; ayrıca bir şey yapmanız gerekmez.
4. **Deploy**'a basın.

### İlk dağıtımdan sonra veritabanını hazırlama

Yerel makinenizden, `.env` içindeki `DATABASE_URL` üretim veritabanını gösterecek şekilde:

```bash
npx prisma migrate deploy
npx prisma db seed
```

> Vercel Postgres kullanıyorsanız bağlantı adresini proje panosundaki **Storage → .env.local** bölümünden alabilirsiniz.

---

## 9. Yapay zeka mantığı (`lib/gemini.ts`)

| Fonksiyon                              | Görev                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| `generateQuestions(topic, grade, n)`   | Konuya ve sınıf düzeyine uygun açık uçlu soru + rubrik dizisi üretir                   |
| `evaluateAnswer(q, rubric, max, resp)` | Tek bir yanıtı rubriğe göre puanlar; `score`, `feedback`, `strengths`, `improvements`  |
| `generateOverallFeedback(answers)`     | Tüm yanıtlara bakarak 3-4 cümlelik genel değerlendirme yazar                           |

- Model: `gemini-2.5-flash`, `responseMimeType: "application/json"` ile katı JSON çıktısı.
- Sistem yönergesi: *"Sen bir Bilişim Teknolojileri ve Yazılım öğretmenisin. Ortaokul öğrencilerine Türkçe, teşvik edici ve somut geri bildirim verirsin. Yalnızca geçerli JSON döndür."*
- Testteki tüm sorular `Promise.all` ile **paralel** değerlendirilir.
- Başarısız istek **1 kez** yeniden denenir; yine başarısızsa kullanıcıya anlaşılır bir Türkçe hata mesajı gösterilir ve yarım kalan deneme kaydı silinir.
- Boş yanıtlar modele hiç gönderilmez; kural gereği doğrudan 0 puan alır.
