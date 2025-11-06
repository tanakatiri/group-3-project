# Notification Badges System

## Overview
Red notification badges (like Reddit) that appear on portal tabs to alert users of new activity.

---

## ✅ What's Implemented

### **Landlord Portal Notifications**

#### 📋 Applications Tab
- **Shows:** Count of pending applications
- **When it appears:** When tenants submit rental applications
- **Action needed:** Landlord needs to approve/reject
- **Example:** Red badge shows "3" = 3 pending applications

#### 💰 Payments Tab
- **Shows:** Count of pending/held payments
- **When it appears:** When tenants make payments that are pending or held in escrow
- **Action needed:** Wait for admin to verify/release
- **Example:** Red badge shows "2" = 2 payments awaiting admin action

#### 📧 Inquiries Tab
- **Shows:** Total count of property inquiries
- **When it appears:** When tenants send inquiries about properties
- **Action needed:** Landlord should respond to inquiries
- **Example:** Red badge shows "5" = 5 total inquiries

#### 💬 Messages Tab
- **Shows:** Count of unread messages
- **When it appears:** When tenants send messages to landlord
- **Action needed:** Landlord should read and reply
- **Example:** Red badge shows "7" = 7 unread messages

---

### **Tenant Portal Notifications**

#### 📋 My Applications Tab
- **Shows:** Count of approved applications
- **When it appears:** When landlord approves an application
- **Action needed:** Tenant needs to make payment
- **Example:** Red badge shows "1" = 1 approved application (needs payment)

#### 💰 Payments Tab
- **Shows:** Count of pending/held payments
- **When it appears:** After tenant submits payment
- **Action needed:** Wait for admin verification
- **Example:** Red badge shows "2" = 2 payments being processed

#### 💬 Messages Tab
- **Shows:** Count of unread messages
- **When it appears:** When landlords send messages to tenant
- **Action needed:** Tenant should read and reply
- **Example:** Red badge shows "3" = 3 unread messages

---

## 🎨 Visual Design

### Badge Appearance
```
┌─────────────────────────────┐
│  💬 Messages          [5]   │  ← Red badge with white number
└─────────────────────────────┘
```

**Features:**
- 🔴 **Red background** (#ff4444)
- ⚪ **White text**
- 🎯 **Top-right corner** of tab button
- ✨ **Pulsing animation** (subtle scale effect)
- 📊 **Shows "99+"** if count exceeds 99
- 👻 **Auto-hides** when count is 0

### CSS Styling
```css
.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff4444;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  animation: pulse 2s infinite;
}
```

---

## ⚙️ How It Works

### Auto-Update System
1. **Initial Load:** Badges update when user logs in
2. **Auto-Refresh:** Updates every 30 seconds automatically
3. **Real-time Counts:** Fetches latest data from API
4. **Smart Display:** Only shows when count > 0

### Update Flow

#### For Landlords:
```
Tenant Action → API Update → Badge Updates (every 30s)
```

**Example Scenario:**
1. Tenant sends message at 2:00 PM
2. Landlord's Messages badge shows "1" (within 30 seconds)
3. Landlord reads message
4. Badge disappears (within 30 seconds)

#### For Tenants:
```
Landlord Action → API Update → Badge Updates (every 30s)
```

**Example Scenario:**
1. Landlord approves application at 3:00 PM
2. Tenant's Applications badge shows "1" (within 30 seconds)
3. Tenant makes payment
4. Badge moves to Payments tab

---

## 📋 Notification Rules

### Landlord Notifications

| Tab | Triggers | Count Logic |
|-----|----------|-------------|
| Applications | Tenant submits application | `status === 'pending'` |
| Payments | Tenant makes payment | `status === 'pending' OR 'held'` |
| Inquiries | Tenant sends inquiry | All inquiries for landlord's properties |
| Messages | Tenant sends message | Unread messages count |

### Tenant Notifications

| Tab | Triggers | Count Logic |
|-----|----------|-------------|
| Applications | Landlord approves application | `status === 'approved'` |
| Payments | Payment pending/held | `status === 'pending' OR 'held'` |
| Messages | Landlord sends message | Unread messages count |

---

## 🔄 Update Frequency

- **Initial:** Loads immediately on login
- **Interval:** Every 30 seconds
- **Manual:** When user performs actions (approve, reject, etc.)

### Why 30 Seconds?
- ✅ Near real-time updates
- ✅ Low server load
- ✅ Good user experience
- ✅ Battery friendly

---

## 💡 Use Cases

### Scenario 1: New Application
```
1. Tenant applies for property
2. Landlord sees red "1" on Applications tab
3. Landlord clicks tab, reviews application
4. Landlord approves
5. Badge disappears
6. Tenant sees red "1" on Applications tab
7. Tenant makes payment
8. Tenant's badge moves to Payments tab
```

### Scenario 2: New Message
```
1. Tenant sends message: "Is the property still available?"
2. Landlord sees red "1" on Messages tab
3. Landlord clicks tab, reads message
4. Badge disappears
5. Landlord replies
6. Tenant sees red "1" on Messages tab
7. Tenant reads reply
8. Badge disappears
```

### Scenario 3: Payment Flow
```
1. Tenant makes payment
2. Tenant sees red "1" on Payments tab (pending)
3. Admin verifies payment
4. Payment status changes to "held"
5. Landlord sees red "1" on Payments tab
6. Admin releases payment
7. Both badges disappear
```

---

## 🎯 Badge Behavior

### When Badge Appears
- ✅ Count > 0
- ✅ User has items requiring attention
- ✅ Pulsing animation active

### When Badge Disappears
- ✅ Count = 0
- ✅ All items handled
- ✅ No action needed

### Badge Updates
- ✅ Every 30 seconds (automatic)
- ✅ On page load
- ✅ After user actions (approve, reject, etc.)

---

## 🛠️ Technical Implementation

### Files Modified
1. **`public/portal.html`**
   - Added badge HTML elements to tab buttons
   - Landlord tabs: 4 badges
   - Tenant tabs: 3 badges

2. **`public/style.css`**
   - Added `.notification-badge` styles
   - Added pulse animation
   - Made `.tab-btn` position relative

3. **`public/portal.js`**
   - Added `updateNotificationBadge()` function
   - Added `updateLandlordNotifications()` function
   - Added `updateTenantNotifications()` function
   - Added auto-refresh interval (30s)
   - Added initial load triggers

### API Endpoints Used
```javascript
// Landlord
GET /api/rental-applications/received
GET /api/payments/landlord-payments
GET /api/inquiries
GET /api/messages/conversations

// Tenant
GET /api/rental-applications/my-applications
GET /api/payments/my-payments
GET /api/messages/conversations
```

---

## 📊 Example Badge States

### Landlord Dashboard
```
┌────────────────────────────────────────┐
│ My Properties  Add Property            │
│                                         │
│ 📋 Applications [3]  💰 Payments [2]   │
│ 📧 Inquiries [5]     💬 Messages [7]   │
└────────────────────────────────────────┘
```

### Tenant Dashboard
```
┌────────────────────────────────────────┐
│ All Properties  My Favorites           │
│                                         │
│ 📋 My Applications [1]  💰 Payments [2]│
│ 💬 Messages [3]                        │
└────────────────────────────────────────┘
```

---

## ✅ Testing Checklist

### Landlord Side
- [ ] New application → Applications badge appears
- [ ] Approve application → Applications badge decreases
- [ ] New payment → Payments badge appears
- [ ] Admin releases payment → Payments badge decreases
- [ ] New inquiry → Inquiries badge appears
- [ ] New message → Messages badge appears
- [ ] Read message → Messages badge decreases

### Tenant Side
- [ ] Application approved → Applications badge appears
- [ ] Make payment → Applications badge disappears, Payments badge appears
- [ ] Payment verified → Payments badge updates
- [ ] New message → Messages badge appears
- [ ] Read message → Messages badge decreases

### Auto-Update
- [ ] Badges update within 30 seconds
- [ ] Badges show correct counts
- [ ] Badges hide when count = 0
- [ ] Badges show "99+" for counts > 99

---

## 🎨 Customization Options

### Change Update Frequency
```javascript
// In portal.js, change interval (currently 30000ms = 30s)
setInterval(() => {
  // ...
}, 30000); // Change this value
```

### Change Badge Color
```css
/* In style.css */
.notification-badge {
  background: #ff4444; /* Change to any color */
}
```

### Change Badge Position
```css
/* In style.css */
.notification-badge {
  top: 8px;    /* Adjust vertical position */
  right: 8px;  /* Adjust horizontal position */
}
```

---

## 🚀 Future Enhancements

### Possible Additions
1. **Sound notifications** - Play sound when new notification arrives
2. **Browser notifications** - Desktop notifications when tab is inactive
3. **Different colors** - Red for urgent, blue for info, green for success
4. **Notification history** - Log of all notifications
5. **Mark as read** - Manually dismiss notifications
6. **Priority badges** - Different styles for urgent vs normal
7. **Hover tooltips** - Show details on hover

---

## 📝 Summary

### What Users See

**Landlords:**
- 🔴 Red badges on tabs when action needed
- 📊 Number shows how many items
- ✨ Pulsing animation grabs attention
- 🔄 Updates every 30 seconds

**Tenants:**
- 🔴 Red badges when landlord responds
- 📊 Number shows pending items
- ✨ Pulsing animation grabs attention
- 🔄 Updates every 30 seconds

### Benefits
✅ **Never miss important updates**  
✅ **Know exactly how many items need attention**  
✅ **Visual cue without being intrusive**  
✅ **Works for both landlords and tenants**  
✅ **Auto-updates in background**  

---

**Status:** ✅ Fully Implemented  
**Date:** October 13, 2025  
**Feature:** Notification Badges System
