# Sistem Pengurusan Mesyuarat — DPMM Negeri Johor

Sistem pengurusan kehadiran mesyuarat berasaskan web untuk Dewan Perniagaan Melayu Malaysia Negeri Johor.

## Ciri-ciri Utama

- **Kehadiran digital** — rekod, kemaskini, dan cetak senarai kehadiran
- **Aiman AI** — pembantu AI berkuasa Groq untuk analisis mesyuarat dan jana blast WhatsApp
- **WA Blast Queue** — senarai antrian mesej WhatsApp disimpan ke Supabase, dihantar via WAHA pada laptop
- **Peringatan emel automatik** — GitHub Actions cron hantar emel 3 hari sebelum mesyuarat
- **Google Drive** — folder mesyuarat dijana automatik
- **Template WhatsApp** — simpan dan guna semula template mesej
- **Eksport CSV & Cetak** — laporan kehadiran dalam pelbagai format

## Peranan Pengguna

| Peranan | Cipta Mesyuarat | Hantar WA | Kemaskini Kehadiran |
|---|---|---|---|
| `admin` | ✅ | ✅ | ✅ |
| `user` (Pentadbir) | ❌ | ✅ | ✅ |
| `ajk` | ❌ | ❌ | ✅ |

## Persediaan

### 1. Supabase

Jalankan fail-fail SQL berikut dalam **Supabase SQL Editor**:

1. `migrations/2026_04_22_full_schema.sql` — Bina semua jadual
2. `migrations/2026_04_22_105210_create_dpm_w_templates.sql` — Jadual template WA (opsional)

### 2. GitHub Secrets

Tambah secrets berikut dalam **Settings → Secrets and variables → Actions**:

| Secret | Nilai |
|---|---|
| `SUPABASE_KEY` | Anon key dari Supabase Dashboard |
| `GOOGLE_CID` | Google OAuth Client ID (tinggalkan kosong jika tidak guna Drive) |
| `GMAIL_USER` | Emel Gmail untuk penghantaran peringatan |
| `GMAIL_PASS` | Gmail App Password (bukan kata laluan biasa) |
| `ADMIN_EMAIL` | Emel pentadbir untuk terima peringatan |

### 2.1. Supabase Edge Function Secrets

Untuk Aiman AI chatbot, tambah environment variable dalam **Supabase Dashboard → Edge Functions → groq-chatbot → Environment Variables**:

| Environment Variable | Nilai |
|---|---|
| `GROQ_KEY` | API key dari [console.groq.com](https://console.groq.com) |

Kemudian deploy Edge Function:
```bash
npx supabase functions deploy groq-chatbot --project-ref lzoloupwtqmjyupvofhh
```

### 3. GitHub Pages

Settings → Pages → Source: **GitHub Actions**

Push ke `main` akan mencetuskan deploy automatik.

### 4. WAHA (WhatsApp Blast)

```bash
# Jalankan apabila ingin hantar blast WA
docker run -it --rm -p 3000:0 -v waha_data:/app/.waha devlikeapro/waha

# Imbas QR di http://localhost:3000 (hanya sekali)
cd scripts
npm install
node blast-runner.js
```

### 5. Supabase Edge Function (Auto-seed kehadiran)

```bash
npx supabase login
npx supabase link --project-ref lzoloupwtqmjyupvofhh
npx supabase functions deploy seed-attendance --project-ref lzoloupwtqmjyupvofhh
```

Tambah `SUPABASE_SERVICE_ROLE_KEY` dalam Supabase Dashboard → Edge Functions → Manage Secrets.

## Pembangunan Tempatan

Buka `index.html` terus dalam browser atau guna VS Code Live Server.

Untuk ujian dengan kunci sebenar, salin `config-local.js.example` ke `config-local.js` (tidak di-commit).

## Stack Teknologi

- **Frontend**: HTML + Vanilla JS + Tailwind CSS (CDN)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Groq API (Llama 3)
- **WA Automation**: WAHA (Docker, jalankan tempatan)
- **Email**: Nodemailer + Gmail App Password
- **Deploy**: GitHub Pages + GitHub Actions