# Phone Number Validation - Zimbabwe Format

## Validation Rules

**Format:** `+263` followed by exactly 9 digits

**Examples:**
- ✅ Valid: `+263771234567`
- ✅ Valid: `+263712345678`
- ❌ Invalid: `263771234567` (missing +)
- ❌ Invalid: `+26377123456` (only 8 digits)
- ❌ Invalid: `+2637712345678` (10 digits)
- ❌ Invalid: `+263 77 123 4567` (contains spaces)

## Implementation

### Frontend Validation

#### 1. HTML Input Validation
All phone input fields have:
- `pattern="\+263[0-9]{9}"` - HTML5 pattern validation
- `placeholder="+263771234567"` - Example format
- `title="Phone number must be in format +263 followed by 9 digits"` - Error message
- Helper text below input showing format requirements

**Files Updated:**
- `public/index.html` - Tenant phone in inquiry form (line 102)
- `public/landlord.html` - Landlord contact in add form (line 147)
- `public/landlord.html` - Landlord contact in edit form (line 230)

#### 2. JavaScript Validation
Added `validatePhoneNumber()` function in both frontend JS files:

```javascript
function validatePhoneNumber(phone) {
  const phoneRegex = /^\+263[0-9]{9}$/;
  return phoneRegex.test(phone);
}
```

**Files Updated:**
- `public/script.js` - Validates tenant phone before inquiry submission (line 273-277)
- `public/landlord.js` - Validates landlord contact before adding/editing property (line 16-20)

### Backend Validation

#### 1. Mongoose Model Validation
All phone fields in models have custom validators:

```javascript
validate: {
  validator: function(v) {
    return /^\+263[0-9]{9}$/.test(v);
  },
  message: props => `${props.value} is not a valid Zimbabwe phone number! Format: +263 followed by 9 digits`
}
```

**Files Updated:**
- `models/User.js` - User phone field (line 22-31)
- `models/Inquiry.js` - Tenant phone field (line 17-26)
- `models/House.js` - Landlord contact field (line 40-50, allows empty)

#### 2. Route Validation
All POST/PUT routes validate phone numbers before processing:

**Files Updated:**
- `routes/authRoutes.js` - User registration (line 17-23)
- `routes/inquiryRoutes.js` - New inquiry submission (line 32-40)
- `routes/houseRoutes.js` - Add house (line 32-40)
- `routes/houseRoutes.js` - Update house (line 53-61)

## User Experience

### Error Messages

**Frontend:**
- HTML5 validation shows: "Phone number must be in format +263 followed by 9 digits"
- JavaScript validation shows: "Invalid phone number. Please use format: +263 followed by 9 digits (e.g., +263771234567)"

**Backend:**
- API returns: "Invalid phone number format. Please use +263 followed by 9 digits (e.g., +263771234567)"

### Visual Helpers
- Placeholder text shows example: `+263771234567`
- Small helper text below inputs: "Format: +263 followed by 9 digits"

## Testing

### Valid Test Cases
```
+263771234567
+263712345678
+263781234567
+263731234567
```

### Invalid Test Cases
```
263771234567     (missing +)
+26377123456     (only 8 digits)
+2637712345678   (10 digits)
+263 77 123 4567 (contains spaces)
+264771234567    (wrong country code)
771234567        (no country code)
```

## Validation Layers

1. **HTML5 Pattern** - Immediate feedback on input
2. **JavaScript** - Pre-submission validation with custom error messages
3. **Backend Route** - Server-side validation before database operations
4. **Mongoose Model** - Final validation layer at database level

This multi-layer approach ensures data integrity and provides clear user feedback at every stage.
