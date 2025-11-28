# 🚨 CRITICAL SECURITY FIX REQUIRED

## ⚠️ Your Google API Key was EXPOSED on GitHub!

GitGuardian detected that your Gemini API key was pushed to the public repository.

**Exposed Key:** `AIzaSyDHclclZU5bTLlLRf4ALoAGQJs_g8F2eUY`

---

## 🔴 IMMEDIATE ACTIONS REQUIRED (DO THIS NOW!)

### Step 1: Revoke the Old API Key (CRITICAL!)

1. Truy cập: **https://console.cloud.google.com/apis/credentials**
2. Tìm API key: `AIzaSyDHclclZU5bTLlLRf4ALoAGQJs_g8F2eUY`
3. Click vào key đó
4. Click "DELETE" hoặc "DISABLE"
5. Confirm deletion

**WHY:** Bất kỳ ai cũng có thể thấy key này trên GitHub và sử dụng quota của anh!

---

### Step 2: Create a NEW API Key

1. Vẫn ở: **https://console.cloud.google.com/apis/credentials**
2. Click "CREATE CREDENTIALS" → "API Key"
3. Copy key mới (sẽ có dạng: `AIzaSy...`)
4. Click "RESTRICT KEY" (recommended):
   - Application restrictions: None (hoặc HTTP referrers nếu có domain)
   - API restrictions: Select "Generative Language API"
5. Save

---

### Step 3: Update Your Local .env.local

```bash
# Open .env.local and replace:
VITE_GEMINI_API_KEY=YOUR_NEW_KEY_HERE
```

Replace `YOUR_NEW_KEY_HERE` với key mới vừa tạo.

---

### Step 4: Clean Git History (Remove exposed key from GitHub)

**Option A: Force Push Clean Commits (RECOMMENDED)**

```bash
# 1. Backup current code
cp -r /Users/buidinhtri/Downloads/finpartner-ai /Users/buidinhtri/Downloads/finpartner-ai-backup

# 2. Remove sensitive commits from history
cd /Users/buidinhtri/Downloads/finpartner-ai

# 3. Find commits with exposed key
git log --all --full-history --source -- .env.local

# 4. Use BFG Repo-Cleaner (easiest method)
# Download: https://rtyley.github.io/bfg-repo-cleaner/
brew install bfg  # On macOS

# 5. Clean the API key from history
bfg --replace-text <(echo 'AIzaSyDHclclZU5bTLlLRf4ALoAGQJs_g8F2eUY==>REMOVED_API_KEY') .

# 6. Clean up and force push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin main --force
```

**Option B: Delete Repository and Re-create (NUCLEAR OPTION)**

If you want a completely clean slate:

```bash
# 1. Backup your code
cp -r /Users/buidinhtri/Downloads/finpartner-ai /Users/buidinhtri/Downloads/finpartner-ai-backup

# 2. Delete GitHub repository
# Go to: https://github.com/tridinhbui/finpartner-ai/settings
# Scroll down → "Delete this repository"

# 3. Create new repository
# Go to: https://github.com/new
# Name: finpartner-ai

# 4. Re-initialize and push
cd /Users/buidinhtri/Downloads/finpartner-ai
rm -rf .git
git init
git add .
git commit -m "Initial commit (clean - no secrets)"
git branch -M main
git remote add origin https://github.com/tridinhbui/finpartner-ai.git
git push -u origin main --force
```

---

## ✅ Verification Checklist

After completing the steps above:

- [ ] ✅ Old API key deleted/disabled in Google Cloud Console
- [ ] ✅ New API key created
- [ ] ✅ `.env.local` updated with new key
- [ ] ✅ App works with new key (test by sending a message)
- [ ] ✅ Git history cleaned (no traces of old key)
- [ ] ✅ Force pushed to GitHub
- [ ] ✅ GitGuardian alert marked as resolved

---

## 🛡️ Prevention for Future

### 1. Add .env.local to .gitignore

Check if `.gitignore` contains:

```
.env.local
.env*.local
```

### 2. Use git-secrets

Install and setup:

```bash
brew install git-secrets
cd /Users/buidinhtri/Downloads/finpartner-ai
git secrets --install
git secrets --register-aws
```

### 3. Pre-commit Hooks

Install pre-commit hook to prevent secrets:

```bash
npm install -D @commitlint/cli husky
npx husky install
npx husky add .husky/pre-commit "grep -r 'AIzaSy' . && echo 'API key detected!' && exit 1 || exit 0"
```

---

## 📞 Need Help?

If you see any charges on your Google Cloud account from unauthorized usage:
- Contact Google Cloud Support immediately
- File a security incident report
- Request refund for fraudulent usage

---

## 🔍 Check if Key Was Used

Check Google Cloud Console:
1. Go to: https://console.cloud.google.com/apis/dashboard
2. Look at "Traffic" graph
3. Check for unusual spikes after November 28, 2025

If you see suspicious activity → Report to Google immediately.

---

## ⚠️ IMPORTANT NOTES

- **DO NOT** use the old key anymore (even if it still works)
- **DO NOT** commit `.env.local` to Git ever again
- **ALWAYS** check what files you're committing: `git status` before `git add`
- Consider using environment variable management services like:
  - Vercel Environment Variables (if deploying to Vercel)
  - GitHub Secrets (for CI/CD)
  - AWS Secrets Manager / Google Secret Manager (for production)

---

## 🎯 Summary

**What happened:**
- Your Gemini API key was accidentally committed to `.env.local`
- The commit was pushed to public GitHub repository
- GitGuardian detected it and alerted you

**What you need to do:**
1. ✅ Delete old key in Google Cloud Console
2. ✅ Create new key
3. ✅ Update `.env.local`
4. ✅ Clean Git history
5. ✅ Test app with new key

**Status:**
- Old key removed from `.env.local` locally ✅
- Git history still contains the key ⚠️ (needs cleaning)
- Tailwind CSS fixed ✅
- App ready to run with new key ✅

---

Sau khi hoàn thành các bước trên, app sẽ hoạt động bình thường và secure! 🔒

