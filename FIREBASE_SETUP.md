# 🔒 Firebase Firestore Setup Guide

## Firebase Security Rules for Guest Payments

To ensure your Guest Payment collection works correctly, you need to set up proper Firestore security rules.

---

## 📋 Firestore Rules

### **Option 1: Development (Allow All - Use for Testing Only)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Guest Payments Collection - Development Mode
    match /guestPayments/{document=**} {
      allow read, write: if true;
    }
    
    // Guests Collection (existing)
    match /guests/{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning:** This allows anyone to read/write data. Only use during development!

---

### **Option 2: Production (Authenticated Users Only)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Guest Payments Collection - Authenticated Users
    match /guestPayments/{paymentId} {
      // Allow authenticated users to read all payments
      allow read: if isAuthenticated();
      
      // Allow authenticated users to create/update/delete payments
      allow create, update, delete: if isAuthenticated();
    }
    
    // Guests Collection (existing)
    match /guests/{guestId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isAuthenticated();
    }
  }
}
```

✅ **Recommended for production:** Only authenticated users can access the data.

---

### **Option 3: Advanced (Role-Based Access)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Guest Payments Collection - Admin Only
    match /guestPayments/{paymentId} {
      // Anyone can read (for public wedding pages)
      allow read: if true;
      
      // Only admins can write
      allow create, update, delete: if isAdmin();
    }
    
    // Guests Collection - Admin Only
    match /guests/{guestId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Users Collection (for role management)
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 How to Apply Rules

### **Step 1: Go to Firebase Console**
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **norea-psms-storage**

### **Step 2: Navigate to Firestore**
1. Click on **"Firestore Database"** in the left sidebar
2. Click on the **"Rules"** tab at the top

### **Step 3: Update Rules**
1. Copy one of the rule sets above (start with Option 1 for testing)
2. Paste it into the rules editor
3. Click **"Publish"**

### **Step 4: Verify**
1. Go back to your app
2. Try adding a guest payment
3. Check if it appears in the list
4. If you get permission errors, check the rules again

---

## 🔍 Testing Rules

### **Check Current Rules:**
```bash
# In your project directory
firebase firestore:indexes
```

### **Test in Console:**
1. Go to Firestore → Rules
2. Click **"Rules Playground"**
3. Simulate operations:
   - **Operation:** `get`
   - **Location:** `/guestPayments/test123`
   - **Authenticated:** Yes/No
4. Click **"Run"**

---

## 📊 Firestore Indexes (Optional)

For better performance when filtering, add these indexes:

### **Via Console:**
1. Go to Firestore → Indexes
2. Click **"Create Index"**
3. Add these:

**Index 1: Category + Created Date**
- Collection: `guestPayments`
- Fields indexed:
  - `category` (Ascending)
  - `createdAt` (Descending)

**Index 2: Currency + Created Date**
- Collection: `guestPayments`
- Fields indexed:
  - `currency` (Ascending)
  - `createdAt` (Descending)

### **Via Command Line:**
Create a file `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "guestPayments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "guestPayments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "currency", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Then deploy:
```bash
firebase deploy --only firestore:indexes
```

---

## 🛡️ Security Best Practices

### **1. Never Use `allow read, write: if true` in Production**
- This makes your database publicly accessible
- Anyone can delete all your data
- Only use during development

### **2. Always Validate Data**
Add validation rules:
```javascript
match /guestPayments/{paymentId} {
  allow create: if isAuthenticated() &&
    request.resource.data.name is string &&
    request.resource.data.amount is number &&
    request.resource.data.amount > 0 &&
    request.resource.data.currency in ['USD', 'KHR'] &&
    request.resource.data.category in ['Family', 'Friend', 'Colleague', 'VIP', 'Other'];
}
```

### **3. Limit Document Size**
```javascript
allow create: if isAuthenticated() &&
  request.resource.size() < 1000000; // 1MB limit
```

### **4. Rate Limiting**
Consider using Cloud Functions for rate limiting to prevent abuse.

---

## 🔧 Troubleshooting

### **Error: "Missing or insufficient permissions"**
- Check if you're logged in (if using authentication)
- Verify the Firestore rules allow the operation
- Check browser console for detailed error

### **Error: "The query requires an index"**
- Firestore automatically suggests creating indexes
- Click the link in the console error
- Or create manually as shown above

### **Data Not Updating**
- Check Firebase console directly
- Verify network connection
- Check browser console for errors
- Ensure rules allow writes

---

## 🎯 Recommended Setup for Your Project

Since your app uses Firebase Authentication (based on the login page), use **Option 2: Production Rules**.

### **Quick Setup:**

1. **Apply Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /guestPayments/{document=**} {
      allow read, write: if isAuthenticated();
    }
    
    match /guests/{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

2. **Ensure users log in** before accessing `/guest-payment`

3. **Add route protection** (already done via `useAuth` in HomePage)

4. **Test thoroughly** before going live

---

## ✅ Checklist

Before launching:
- [ ] Firebase rules are set (not `if true` in production)
- [ ] Authentication is working
- [ ] Users can add/view/delete payments
- [ ] Data appears in Firebase console
- [ ] No permission errors in browser console
- [ ] Indexes are created (if filtering is slow)
- [ ] Tested on multiple devices
- [ ] Backup strategy in place

---

## 📚 Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Playground](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Best Practices](https://firebase.google.com/docs/firestore/security/rules-conditions)

---

**Your Firebase setup is crucial for security and performance. Follow these guidelines carefully! 🔒**
