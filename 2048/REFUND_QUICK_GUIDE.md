# Quick Guide: How to Refund a Payment

## When to Use Refund
Use the refund feature when a tenant has made a payment but decides not to proceed with renting the property.

## Refund Rules
✅ **Can Refund:**
- Pending payments (not yet verified)
- Held payments (verified but not released)

❌ **Cannot Refund:**
- Released payments (already given to landlord)
- Rejected payments
- Already refunded payments

## How to Refund a Payment

### Step 1: Login as Admin
- Go to: http://localhost:5000/admin
- Login with admin credentials

### Step 2: Navigate to Payments
- Click on the "Payments" tab in the admin dashboard

### Step 3: Find the Payment
- Locate the payment you want to refund
- Check the status - must be "Pending" or "Held in Escrow"

### Step 4: Click Refund Button
- Click the purple "💸 Refund to Tenant" button

### Step 5: Enter Refund Reason
- A prompt will appear asking for the refund reason
- Enter a clear reason (e.g., "Tenant cancelled application")
- This is **required** - you cannot proceed without a reason

### Step 6: Confirm Refund
- A confirmation dialog will appear
- Click "OK" to confirm the refund
- Click "Cancel" if you changed your mind

### Step 7: Verify Refund
- The payment status will change to "Refunded to Tenant" (purple badge)
- The refund date and reason will be displayed
- Statistics will update to show the refunded amount

## What Happens After Refund?

1. **Payment Status**: Changes to "Refunded"
2. **Color**: Purple badge
3. **Recorded Info**:
   - Refund date and time
   - Admin who processed the refund
   - Refund reason
4. **Tenant View**: Tenant can see the refunded status in their portal
5. **Statistics**: Dashboard stats update to show refunded count and amount

## Example Scenarios

### Scenario 1: Tenant Changes Mind Before Verification
- Tenant submits payment: $500
- Status: Pending
- Tenant calls and says they found another place
- Admin clicks "💸 Refund to Tenant"
- Enters reason: "Tenant found alternative accommodation"
- Confirms → Status: Refunded

### Scenario 2: Tenant Cancels After Verification
- Tenant submits payment: $800
- Admin verifies → Status: Held in Escrow
- Tenant's circumstances change
- Admin clicks "💸 Refund to Tenant"
- Enters reason: "Tenant relocated to different city"
- Confirms → Status: Refunded

### Scenario 3: Cannot Refund (Already Released)
- Payment was released to landlord
- Status: Released
- No refund button available
- Must handle refund outside the system with landlord

## Tips

💡 **Always enter a clear refund reason** - This helps with record-keeping and audits

💡 **Double-check before confirming** - Refunds cannot be undone in the system

💡 **Communicate with tenant** - Let them know the refund has been processed

💡 **Check statistics** - Monitor refund trends in the dashboard

## Troubleshooting

**Q: I don't see the refund button**
- Check the payment status - only pending and held payments can be refunded
- Ensure you're logged in as admin or super admin

**Q: Refund button is greyed out**
- Payment may have already been released or rejected
- Check the payment status

**Q: Error: "Cannot refund released payments"**
- The payment has already been given to the landlord
- Contact the landlord directly for refund

**Q: Error: "Refund reason is required"**
- You must enter a reason for the refund
- Try again and provide a reason

## Admin Credentials

**Super Admin:**
- Email: superadmin@renthub.com
- Password: superadmin123

**Regular Admin:**
- Email: admin@renthub.com
- Password: admin123

## Support

For technical issues or questions, check:
- `REFUND_FEATURE.md` - Detailed technical documentation
- `FIXES_APPLIED.md` - Recent system fixes
