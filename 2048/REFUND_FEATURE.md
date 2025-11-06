# Payment Refund Feature

## Overview
Added the ability for admins to refund payments back to tenants when they decide not to proceed with renting a property.

## Feature Details

### When Can Payments Be Refunded?
- **Pending Payments**: Can be refunded before verification
- **Held Payments**: Can be refunded while in escrow (before release to landlord)
- **Released Payments**: CANNOT be refunded (already given to landlord)
- **Rejected Payments**: CANNOT be refunded (already rejected)

### Refund Process
1. Admin views payment in the Payments tab
2. Clicks "💸 Refund to Tenant" button
3. Enters refund reason (required)
4. Confirms the refund action
5. Payment status changes to "Refunded"
6. Tenant is notified (via payment status)

## Technical Implementation

### 1. Database Changes (Payment Model)
**File:** `models/Payment.js`

**Added Fields:**
- `status` enum: Added 'refunded' option
- `refundedAt`: Date - Timestamp when payment was refunded
- `refundedBy`: ObjectId - Admin who processed the refund
- `refundReason`: String - Reason for the refund

### 2. API Endpoint
**File:** `routes/paymentRoutes.js`

**New Endpoint:**
```
PUT /api/payments/:id/refund
```

**Request Body:**
```json
{
  "refundReason": "Tenant cancelled application",
  "adminNotes": "Optional admin notes"
}
```

**Response:**
```json
{
  "message": "Payment refunded to tenant successfully",
  "payment": { /* payment object */ }
}
```

**Authorization:** Admin or Super Admin only

**Validation:**
- Refund reason is required
- Only pending or held payments can be refunded
- Returns 400 error if trying to refund released/rejected payments

### 3. Admin Panel UI
**File:** `public/admin.js`

**Added Features:**
- New "Refunded" status badge (purple color #9C27B0)
- Refund button on pending and held payments
- Refund statistics in dashboard
- Displays refund date and reason on refunded payments

**Statistics Added:**
- Refunded count
- Refunded amount (total $)

## Usage Example

### Scenario: Tenant Changes Mind
1. Tenant submits payment for property deposit ($500)
2. Admin verifies payment → Status: "Held in Escrow"
3. Tenant decides not to rent the property
4. Admin clicks "💸 Refund to Tenant"
5. Enters reason: "Tenant found alternative accommodation"
6. Confirms refund
7. Payment status → "Refunded to Tenant"
8. Tenant can see refunded status in their portal

## Payment Status Flow

```
Pending → Verify → Held → Release → Released (to landlord)
                     ↓
                  Refund → Refunded (to tenant)
   ↓
Reject → Rejected
   ↓
Refund → Refunded (to tenant)
```

## Security & Validation

✅ Only admins and super admins can refund payments
✅ Refund reason is mandatory
✅ Confirmation dialog prevents accidental refunds
✅ Cannot refund already released payments
✅ All refunds are logged with timestamp and admin ID
✅ Event logging for audit trail

## UI Elements

### Payment Card Actions
**For Pending Payments:**
- ✅ Verify & Hold
- ❌ Reject
- 💸 Refund to Tenant

**For Held Payments:**
- 💰 Release to Landlord
- 💸 Refund to Tenant

**For Released/Rejected/Refunded:**
- No actions available (final states)

### Status Colors
- 🟠 Pending: Orange (#FFA500)
- 🔵 Held: Blue (#2196F3)
- 🟢 Released: Green (#4CAF50)
- 🔴 Rejected: Red (#f44336)
- 🟣 Refunded: Purple (#9C27B0)

## Testing

### Test Cases
1. ✅ Refund pending payment
2. ✅ Refund held payment
3. ✅ Attempt to refund released payment (should fail)
4. ✅ Attempt to refund without reason (should fail)
5. ✅ View refund statistics
6. ✅ View refund details on payment card

### Manual Testing Steps
1. Log in as admin
2. Go to Payments tab
3. Find a pending or held payment
4. Click "💸 Refund to Tenant"
5. Enter reason: "Test refund"
6. Confirm
7. Verify status changes to "Refunded"
8. Check statistics updated
9. Verify refund date and reason displayed

## Files Modified

1. `models/Payment.js` - Added refund fields
2. `routes/paymentRoutes.js` - Added refund endpoint and updated stats
3. `public/admin.js` - Added refund UI and function

## API Documentation

### Refund Payment
**Endpoint:** `PUT /api/payments/:id/refund`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "refundReason": "Tenant cancelled application",
  "adminNotes": "Processed refund as requested"
}
```

**Success Response (200):**
```json
{
  "message": "Payment refunded to tenant successfully",
  "payment": {
    "_id": "...",
    "status": "refunded",
    "refundedAt": "2025-10-12T20:30:00.000Z",
    "refundedBy": "admin_id",
    "refundReason": "Tenant cancelled application",
    ...
  }
}
```

**Error Responses:**
- 400: Invalid request (missing reason, invalid status)
- 401: Unauthorized (no token)
- 403: Forbidden (not admin)
- 404: Payment not found
- 500: Server error

## Notes

- Refunds are processed immediately in the system
- In a production environment, you would integrate with payment gateway to process actual refund
- Consider adding email notifications to tenants when refund is processed
- Refund history is preserved in the database for audit purposes
- Admin who processed refund is tracked for accountability

## Future Enhancements

1. **Email Notifications**: Notify tenant when refund is processed
2. **Partial Refunds**: Allow refunding partial amounts
3. **Refund Approval Workflow**: Require super admin approval for large refunds
4. **Payment Gateway Integration**: Automatically process refunds through payment provider
5. **Refund Reports**: Generate monthly refund reports
6. **Tenant Refund Requests**: Allow tenants to request refunds (admin approval required)
