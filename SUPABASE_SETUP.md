# Supabase Setup Guide

## 🚀 Quick Setup

### Step 1: Create Supabase Project

1. Truy cập [https://supabase.com](https://supabase.com)
2. Sign up / Login
3. Click "New Project"
4. Điền thông tin:
   - Project name: `finpartner-ai`
   - Database password: (tạo password mạnh)
   - Region: (chọn gần nhất, VD: Singapore)
5. Click "Create new project"

### Step 2: Get API Credentials

1. Vào project dashboard
2. Click ⚙️ **Settings** (sidebar)
3. Click **API** 
4. Copy 2 thông tin:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Setup Database

1. Click 🗄️ **SQL Editor** (sidebar)
2. Click "New Query"
3. Copy toàn bộ nội dung file `supabase-schema.sql`
4. Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Kiểm tra: Vào **Table Editor** → Sẽ thấy 3 tables:
   - `chat_threads`
   - `messages`
   - `documents`

### Step 4: Setup Storage

1. Click 📦 **Storage** (sidebar)
2. Click "Create bucket"
3. Điền:
   - Name: `documents`
   - Public bucket: ✅ **Check** (để có thể xem PDF/Excel)
4. Click "Create bucket"
5. Click vào bucket `documents`
6. Click "Policies" tab
7. Click "New Policy"
8. Select "Allow all operations" (hoặc customize theo nhu cầu)
9. Click "Review" → "Save policy"

### Step 5: Update Environment Variables

Cập nhật file `.env.local`:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_CLIENT_ID=336038131508-c46if7971orgluv3m65noiv58e0o14et.apps.googleusercontent.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Thay thế:**
- `xxxxx.supabase.co` → Project URL của bạn
- `eyJhbGci...` → anon/public key của bạn

### Step 6: Restart App

```bash
# Kill old server
pkill -f "node.*vite"

# Start new server
npm run dev
```

---

## 🔍 Verify Setup

### Check Database Tables

Vào **Table Editor** trong Supabase:

1. **chat_threads** table:
   - Columns: id, user_id, title, created_at, updated_at, workspace_state, highlighted_numbers
   - ✅ RLS enabled

2. **messages** table:
   - Columns: id, thread_id, role, content, timestamp, related_chart, related_table, is_error
   - ✅ Foreign key to chat_threads
   - ✅ RLS enabled

3. **documents** table:
   - Columns: id, thread_id, file_name, file_type, file_size, storage_path, uploaded_at
   - ✅ RLS enabled

### Check Storage Bucket

Vào **Storage** trong Supabase:

1. Bucket `documents` exists
2. Public access enabled
3. Policies configured

### Test in App

1. Login vào app
2. Tạo new chat thread
3. Gửi message
4. Check Supabase dashboard → Table Editor → messages
5. Sẽ thấy message vừa gửi

---

## 📊 Database Schema Diagram

```
┌─────────────────────┐
│   chat_threads      │
├─────────────────────┤
│ id (PK)            │
│ user_id            │
│ title              │
│ created_at         │
│ updated_at         │
│ workspace_state    │
│ highlighted_numbers│
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│     messages        │
├─────────────────────┤
│ id (PK)            │
│ thread_id (FK)     │
│ role               │
│ content            │
│ timestamp          │
│ related_chart      │
│ related_table      │
│ is_error           │
└─────────────────────┘

         │
         │ 1:N
         ▼
┌─────────────────────┐
│    documents        │
├─────────────────────┤
│ id (PK)            │
│ thread_id (FK)     │
│ file_name          │
│ file_type          │
│ file_size          │
│ storage_path       │
│ uploaded_at        │
└─────────────────────┘
```

---

## 🔐 Row Level Security (RLS)

RLS đảm bảo:
- ✅ Users chỉ thấy threads/messages của mình
- ✅ Users chỉ upload/delete files của mình
- ✅ Cross-user data isolation
- ✅ Security by default

Policies tự động check `user_id` match với authenticated user email.

---

## 🛠️ Useful SQL Queries

### View all threads for a user
```sql
SELECT * FROM chat_threads
WHERE user_id = 'user@example.com'
ORDER BY updated_at DESC;
```

### Count messages per thread
```sql
SELECT 
    t.title,
    COUNT(m.id) as message_count
FROM chat_threads t
LEFT JOIN messages m ON t.id = m.thread_id
GROUP BY t.id, t.title;
```

### Check storage usage
```sql
SELECT 
    COUNT(*) as total_files,
    SUM(file_size) / 1024 / 1024 as total_mb,
    file_type,
    COUNT(*) as count
FROM documents
GROUP BY file_type;
```

---

## 🚨 Troubleshooting

### "Failed to connect to Supabase"
- Check VITE_SUPABASE_URL is correct
- Check VITE_SUPABASE_ANON_KEY is correct
- Restart dev server

### "Permission denied" when saving
- Check RLS policies are created
- Verify user is authenticated
- Check user_id matches email

### "Storage upload failed"
- Check bucket exists
- Check bucket is public
- Check file size (<10MB)
- Verify storage policies

---

## 📞 Support

Need help? 
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: https://github.com/tridinhbui/finpartner-ai/issues

