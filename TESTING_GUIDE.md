# Testing Guide - FinPartner AI

## 🧪 Test Scenarios

### Test 1: Demo Mode (Không cần file)

**Mục đích:** Test AI có generate charts & tables không

**Steps:**
1. Reload trang: `http://localhost:3000/`
2. Login (Google hoặc Demo)
3. Gửi message:
```
Tạo dashboard demo cho công ty tech với revenue $10M, $12M, $14M trong Q1, Q2, Q3 2024
```

**Expected Results:**
- ✅ Tab "Visualization" hiển thị bar chart với revenue
- ✅ Tab "Data Grid" hiển thị table với số liệu
- ✅ AI response có insights

**Debug:**
- Mở Console (F12)
- Look for:
  - `📊 Chart received: [title]`
  - `📋 Table received: [title]`
- Nếu không thấy → AI không gọi tools → Check system instruction

---

### Test 2: PDF Upload & Highlighting

**Mục đích:** Test PDF viewing, highlighting, và analysis

**Steps:**
1. Kéo thả file PDF báo cáo tài chính vào chat
2. Hoặc click 📎 → Chọn PDF
3. PDF sẽ hiển thị ở tab "Source Document"
4. Gửi message:
```
Phân tích báo cáo này và highlight các số quan trọng
```

**Expected Results:**
- ✅ Tab "Source Document" hiển thị PDF
- ✅ **Floating panel bên phải** với extracted metrics
- ✅ **Visual markers trên PDF**:
  - Colored highlight boxes
  - Number badges (1, 2, 3...)
  - Arrows pointing từ markers → metrics panel
  - Labels cho mỗi metric
- ✅ Tab "Visualization" có charts
- ✅ Tab "Data Grid" có tables

**Check:**
- [ ] PDF hiển thị đúng?
- [ ] Floating panel xuất hiện góc phải?
- [ ] Có số badges (1,2,3) trên PDF và panel?
- [ ] Có arrows màu nối từ PDF → panel?
- [ ] Có charts ở Visualization tab?
- [ ] Có tables ở Data Grid tab?

**Debug Console:**
```
Look for:
📊 Chart received: ...
📋 Table received: ...
🎯 Metrics received: ... items
```

---

### Test 3: Excel Upload & Analysis

**Mục đích:** Test Excel viewer và analysis

**Steps:**
1. Kéo thả file Excel (.xlsx) vào chat
2. Excel sẽ hiển thị ở tab "Excel"
3. Gửi message:
```
Phân tích tất cả sheets và tạo visualization
```

**Expected Results:**
- ✅ Tab "Excel" hiển thị spreadsheet
- ✅ Multi-sheet tabs (nếu có nhiều sheets)
- ✅ Search box hoạt động
- ✅ Zoom controls hoạt động
- ✅ Charts generated từ Excel data
- ✅ Tables summarizing Excel data

---

### Test 4: Multi-Thread & Persistence

**Mục đích:** Test thread management và PDF persistence

**Steps:**
1. Upload PDF vào thread hiện tại
2. Phân tích PDF
3. Click "New Chat" → Tạo thread mới
4. Upload PDF khác vào thread mới
5. Switch về thread đầu tiên
6. **Check:** PDF đầu tiên vẫn hiển thị?
7. Reload trang (Ctrl+R)
8. **Check:** Threads vẫn còn? PDF vẫn preview được?

**Expected Results:**
- ✅ Mỗi thread lưu riêng PDF
- ✅ Switch thread → PDF thay đổi theo
- ✅ Reload → Threads không mất
- ✅ Reload → PDF vẫn preview được (từ base64)

---

### Test 5: Dark Mode & Settings

**Mục đích:** Test UI features

**Steps:**
1. Click avatar (góc phải)
2. Click "Light Mode" / "Dark Mode"
3. UI chuyển màu ngay
4. Click ra ngoài menu
5. Menu tự đóng
6. Reload trang
7. Theme vẫn được giữ

**Expected Results:**
- ✅ Toggle theme hoạt động
- ✅ Toàn bộ UI chuyển màu
- ✅ Menu đóng khi click outside
- ✅ Theme persist sau reload

---

## 🐛 Common Issues & Fixes

### Issue 1: "Charts không hiển thị"

**Symptoms:**
- Tab Visualization trống
- Console không có "Chart received"

**Fix:**
```javascript
// Check in constants.ts - CRITICAL RULE section
// Should have: "LUÔN GỌI TOOLS"

// Try test command:
"Tạo chart mẫu với revenue $10M, $12M, $14M"

// Check console for errors
```

**Root Cause:**
- AI không gọi renderChart tool
- Check system instruction
- Model có thể cần examples rõ hơn

---

### Issue 2: "PDF mất khi reload"

**Symptoms:**
- Reload → PDF không hiển thị
- Switch thread → PDF trống

**Fix:**
```javascript
// Check workspace.documentData có được save không
// Check localStorage:
const threads = JSON.parse(localStorage.getItem('finpartner_threads'));
console.log(threads[0].workspace.documentData); // Should have base64

// If null → workspace not saving properly
```

**Root Cause:**
- Blob URL not recreated
- Base64 data not saved to thread

---

### Issue 3: "Highlights không xuất hiện"

**Symptoms:**
- Không thấy colored boxes trên PDF
- Không thấy floating panel

**Fix:**
```javascript
// Check console:
🎯 Metrics received: X items // Should see this

// If not → AI không gọi highlightKeyMetrics

// Try explicit command:
"Highlight revenue, net income, và EPS trong PDF này"
```

---

### Issue 4: "Excel không parse được"

**Symptoms:**
- Upload Excel → blank screen
- Console errors về XLSX

**Fix:**
```bash
# Reinstall xlsx
npm install xlsx --force

# Check file type:
console.log(file.type); // Should be application/vnd.openxmlformats...
```

---

## 📊 Performance Tests

### Load Time Test
```
1. Clear cache (Ctrl+Shift+Delete)
2. Reload page
3. Measure:
   - First Paint: < 1s
   - Time to Interactive: < 2s
   - Full Load: < 3s
```

### Large File Test
```
1. Upload PDF > 5MB
2. Should load in < 5s
3. Scrolling should be smooth (60fps)
4. Zoom should work without lag
```

### Multi-Thread Performance
```
1. Create 10 threads
2. Each with different PDF
3. Switch between threads
4. Should switch instantly (< 200ms)
```

---

## ✅ Success Criteria

Một phân tích thành công phải có:

### Visual Elements:
- [ ] ✅ PDF hiển thị rõ ràng
- [ ] ✅ Floating metrics panel bên phải
- [ ] ✅ Visual markers với số badges trên PDF
- [ ] ✅ Arrows/lines từ markers → panel
- [ ] ✅ At least 1 chart trong Visualization
- [ ] ✅ At least 1 table trong Data Grid

### Data Quality:
- [ ] ✅ Numbers accurate (match PDF)
- [ ] ✅ Charts có data thực tế
- [ ] ✅ Tables formatted properly
- [ ] ✅ Highlights có màu sắc phù hợp

### User Experience:
- [ ] ✅ Smooth animations
- [ ] ✅ No console errors
- [ ] ✅ Fast response (< 10s for analysis)
- [ ] ✅ Thread switching works
- [ ] ✅ Data persists after reload

---

## 🔍 Debug Commands

### Check localStorage:
```javascript
// In browser console:
JSON.parse(localStorage.getItem('finpartner_threads'))
```

### Check active thread:
```javascript
// Should show current workspace state
const threads = JSON.parse(localStorage.getItem('finpartner_threads'));
const active = threads[0];
console.log('Workspace:', active.workspace);
console.log('Has PDF:', !!active.workspace.documentData);
console.log('Has Charts:', !!active.workspace.chartData);
```

### Force recreate blob:
```javascript
// If PDF not showing, try manual recreate
const data = active.workspace.documentData;
const type = active.workspace.documentMimeType;
const bytes = atob(data);
const arr = new Uint8Array(bytes.length);
for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
const blob = new Blob([arr], { type });
const url = URL.createObjectURL(blob);
console.log('PDF URL:', url);
```

---

## 🎯 Quick Test Checklist

Run này sau mỗi major change:

```
✅ 1. Reload page → Login works
✅ 2. Send "Tạo dashboard demo" → Charts & tables appear
✅ 3. Upload PDF → PDF shows in Source Document tab
✅ 4. Send "Phân tích" → Highlights appear on PDF
✅ 5. Click Visualization → See charts
✅ 6. Click Data Grid → See tables
✅ 7. Upload Excel → Excel viewer shows
✅ 8. Create New Chat → New thread created
✅ 9. Switch threads → Previous PDF still shows
✅ 10. Reload → Everything persists
✅ 11. Toggle dark mode → UI changes
✅ 12. Logout → Login again → Data still there (if Supabase setup)
```

---

## 📞 When to Report Issues

Report nếu:
- Console có errors màu đỏ
- Charts/Tables không xuất hiện sau 3 lần thử
- PDF không hiển thị sau upload
- Reload làm mất data
- Highlights không có arrows/markers

Include trong report:
1. Screenshot
2. Console logs
3. Steps to reproduce
4. Browser & version

