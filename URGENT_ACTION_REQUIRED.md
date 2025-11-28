# 🚨 URGENT ACTION REQUIRED - API KEY EXPOSED!

## ⚠️ Your API Key Was Leaked on GitHub

GitGuardian detected your Google Gemini API key in the public repository.

**Status:**
- ❌ Exposed key: `AIzaSyDHclclZU5bTLlLRf4ALoAGQJs_g8F2eUY`
- ⚠️ This key is PUBLICLY visible on GitHub
- ⚠️ Anyone can use it and consume your quota
- ✅ Local files cleaned (this commit)
- ❌ Git history still contains the key

---

## 🔴 DO THIS NOW (5 minutes)

### Step 1: Delete Old API Key (2 minutes)

1. **Truy cập:** https://console.cloud.google.com/apis/credentials
2. **Tìm key:** `AIzaSyDHclclZU5bTLlLRf4ALoAGQJs_g8F2eUY`
3. **Click vào key** → Click "DELETE"
4. **Confirm** deletion

⏱️ **Do this IMMEDIATELY** to prevent abuse!

---

### Step 2: Create New API Key (2 minutes)

1. **Vẫn ở:** https://console.cloud.google.com/apis/credentials
2. **Click:** "CREATE CREDENTIALS" → "API Key"
3. **Copy** the new key (starts with `AIzaSy...`)
4. **Click:** "RESTRICT KEY" (recommended)
   - API restrictions: Select "Generative Language API"
5. **Save**

---

### Step 3: Update .env.local (30 seconds)

```bash
# Open this file in your editor:
nano /Users/buidinhtri/Downloads/finpartner-ai/.env.local

# Replace this line:
VITE_GEMINI_API_KEY=YOUR_NEW_GEMINI_API_KEY_HERE

# With your actual new key:
VITE_GEMINI_API_KEY=AIzaSy[your new key here]

# Save and close (Ctrl+X, then Y, then Enter)
```

---

### Step 4: Clean Git History (Automated - 2 minutes)

**Option A: Use our automated script (EASIEST)**

```bash
cd /Users/buidinhtri/Downloads/finpartner-ai
./clean-git-history.sh
```

The script will:
- ✅ Create backup automatically
- ✅ Remove API key from all commits
- ✅ Clean Git history
- ✅ Verify cleanup

**Then push:**
```bash
git push origin main --force
```

---

**Option B: Manual cleanup (if script fails)**

```bash
# Install BFG
brew install bfg

# Clean history
cd /Users/buidinhtri/Downloads/finpartner-ai
bfg --replace-text <(echo 'AIzaSyDHclclZU5bTLlLRf4ALoAGQJs_g8F2eUY==>REMOVED_KEY')

# Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin main --force
```

---

**Option C: Nuclear option - Delete and recreate repo (if nothing else works)**

1. **Backup code:**
   ```bash
   cp -r /Users/buidinhtri/Downloads/finpartner-ai ~/finpartner-ai-backup
   ```

2. **Delete GitHub repo:**
   - Go to: https://github.com/tridinhbui/finpartner-ai/settings
   - Scroll to bottom → "Delete this repository"

3. **Create new repo:**
   - Go to: https://github.com/new
   - Name: `finpartner-ai`
   - Make it Private (recommended)

4. **Push clean code:**
   ```bash
   cd /Users/buidinhtri/Downloads/finpartner-ai
   rm -rf .git
   git init
   git add .
   git commit -m "Initial commit - clean slate"
   git branch -M main
   git remote add origin https://github.com/tridinhbui/finpartner-ai.git
   git push -u origin main --force
   ```

---

## ✅ Verification Checklist

After completing ALL steps:

- [ ] ✅ Old API key deleted in Google Cloud Console
- [ ] ✅ New API key created and restricted
- [ ] ✅ `.env.local` updated with new key
- [ ] ✅ App tested and works with new key
- [ ] ✅ Git history cleaned (no traces of old key)
- [ ] ✅ Changes pushed to GitHub
- [ ] ✅ GitGuardian alert marked as "Fixed" or "False Positive"

---

## 🧪 Test App Works

```bash
cd /Users/buidinhtri/Downloads/finpartner-ai
npm run dev
```

Open http://localhost:3000 and send a test message to verify API key works.

---

## 📊 Check for Abuse

**Monitor your API usage:**

1. Go to: https://console.cloud.google.com/apis/dashboard
2. Check "Traffic" graph
3. Look for unusual spikes after **November 28, 2025**

If you see suspicious activity:
- Contact Google Cloud Support
- Request refund for unauthorized usage
- File security incident report

---

## 🛡️ Prevention

**To prevent this in future:**

1. **Never commit .env files:**
   - ✅ Already in .gitignore: `*.local`
   - Always check: `git status` before committing

2. **Use git-secrets:**
   ```bash
   brew install git-secrets
   git secrets --install
   git secrets --add 'AIzaSy[0-9A-Za-z_-]{33}'
   ```

3. **Enable branch protection:**
   - Go to GitHub repo settings
   - Branches → Add rule for `main`
   - Enable "Require pull request reviews"

---

## 🔗 Detailed Guides

- **Full security guide:** `SECURITY_FIX_GUIDE.md`
- **Automated cleanup script:** `./clean-git-history.sh`
- **Testing guide:** `TESTING_GUIDE.md`

---

## ⏰ Timeline

**What happened:**
- ✅ Nov 28, 2025, 00:59:15 UTC - Key pushed to GitHub
- ✅ Nov 28, 2025 - GitGuardian detected and alerted
- ✅ Now - Local files cleaned
- ⏳ Next - You need to clean Git history and revoke old key

**Current status:**
- 🔴 CRITICAL: Old key still active and exposed in Git history
- 🟡 WARNING: Local files cleaned but not pushed yet
- 🟢 READY: New security measures in place

---

## 💬 Need Help?

If stuck:
1. Read `SECURITY_FIX_GUIDE.md` for detailed instructions
2. Check Google Cloud Support for API key issues
3. GitHub Support for repository issues

---

## 📝 Summary

**What you MUST do:**
1. ✅ Delete old API key (takes 1 minute)
2. ✅ Create new API key (takes 1 minute)
3. ✅ Update `.env.local` (takes 30 seconds)
4. ✅ Run `./clean-git-history.sh` (takes 2 minutes)
5. ✅ Force push to GitHub (takes 30 seconds)

**Total time:** ~5 minutes

**Don't panic!** This is fixable. Just follow the steps above carefully.

---

**After completing these steps, your app will be secure and working! 🔒✅**

