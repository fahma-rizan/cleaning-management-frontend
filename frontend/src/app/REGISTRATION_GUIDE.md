# Cloud Laundry Registration Guide

## Overview
The Cloud Laundry system supports four different user roles, each with a separate registration flow tailored to their specific requirements.

---

## How to Register

### 1. Access the Registration Page
- Click "Sign Up" or "Register" from the homepage or login page
- You'll be automatically redirected to the **Role Selection** page

### 2. Select Your Role
Choose the appropriate role based on your needs:

#### 👥 **Customer Registration**
- **Purpose**: Book and manage cleaning services for your home or office
- **Required Information**:
  - Full Name
  - Email Address
  - Phone Number
  - Complete Address (Street, City, Postal Code)
  - Password (minimum 6 characters)
- **Route**: `/register/customer`
- **Process**: 
  1. Fill out the customer registration form
  2. Verify your email via OTP
  3. Start booking services immediately

---

#### 🧹 **Cleaner Registration**
- **Purpose**: Join the cleaning team and provide professional services
- **Required Information**:
  - Full Name
  - Email Address
  - Phone Number
  - Years of Experience
  - Specialization (Residential, Commercial, Carpet, Window, Deep Cleaning, All Types)
  - Complete Address (Street, City, Postal Code)
  - Password (minimum 6 characters)
- **Required Documents** (Upload):
  - National ID Card / Passport
  - Professional Certificate / Training Certificate
  - Police Clearance Report
- **Route**: `/register/cleaner`
- **Process**: 
  1. Fill out the cleaner registration form
  2. Upload all required verification documents
  3. Verify your email via OTP
  4. Wait for admin approval
  5. Once approved, you can start accepting cleaning jobs

---

#### 👨‍💼 **Staff Registration**
- **Purpose**: Manage operations and support services
- **Required Information**:
  - Full Name
  - Email Address
  - Phone Number
  - Employee ID (e.g., EMP-12345)
  - Department (Operations, Customer Service, Scheduling, Quality Control, Logistics, Finance)
  - Manager Email (for approval)
  - Complete Address (Street, City, Postal Code)
  - Password (minimum 6 characters)
- **Route**: `/register/staff`
- **Process**: 
  1. Fill out the staff registration form
  2. Provide valid Employee ID
  3. Enter manager's email for approval
  4. Verify your email via OTP
  5. Wait for manager approval
  6. Once approved, access staff dashboard and tools

---

#### 🛡️ **Admin Registration** (Restricted)
- **Purpose**: Full system access and management capabilities
- **Required Information**:
  - Full Name
  - Email Address
  - Phone Number
  - Complete Address (Street, City, Postal Code)
  - **Special Access Code** (Required - contact management)
  - Password (minimum 6 characters)
- **Route**: `/register/admin`
- **Demo Access Code**: `ADMIN2024`
- **Process**: 
  1. Obtain the special access code from management
  2. Fill out the admin registration form
  3. Enter the valid access code
  4. Verify your email via OTP
  5. Gain immediate full system access

---

## Registration Flow Diagram

```
User clicks "Register"
        ↓
Role Selection Page
        ↓
    [Choose Role]
        ↓
   ┌────┴────┬────────┬────────┐
   │         │        │        │
Customer  Cleaner  Staff    Admin
   │         │        │        │
   └────┬────┴────────┴────────┘
        ↓
   Fill Registration Form
   (Role-specific fields)
        ↓
   Submit Registration
        ↓
   OTP Verification
        ↓
   Account Created
        ↓
   [Role-based Dashboard]
```

---

## Important Notes

### For All Users:
- ✅ All passwords must be at least 6 characters
- ✅ Email verification via OTP is required for all registrations
- ✅ Use a valid email address - you'll receive important notifications
- ✅ Phone numbers should include country code (e.g., +94 77 123 4567)

### For Cleaners:
- 📄 All documents must be in PDF, JPG, JPEG, or PNG format
- 📄 Documents will be reviewed by administrators before approval
- 🔒 Personal information is kept confidential and secure

### For Staff:
- 👔 Employee ID must be valid and issued by the company
- 📧 Manager email must be an existing staff/admin account
- ⏳ Registration is pending until manager approval

### For Admins:
- 🔐 Access codes are confidential and should not be shared
- 🚨 Admin accounts have full system privileges
- 📊 Intended for system administrators and management only

---

## Troubleshooting

### Can't register as Admin?
- Ensure you have the correct access code from management
- Demo code for testing: `ADMIN2024`

### Can't register as Staff?
- Verify your Employee ID is correct
- Ensure your manager's email is valid and exists in the system

### Can't register as Cleaner?
- Check that all documents are uploaded successfully
- Ensure files are in supported formats (PDF, JPG, PNG)
- File size should be reasonable (under 5MB recommended)

### OTP not received?
- Check your spam/junk folder
- Ensure the email address is correct
- Wait 2-3 minutes and try again

---

## Demo Accounts

For testing purposes, you can use:

**Admin Account:**
- Email: `admin@cloudlaundry.lk`
- Password: `admin123`

**Customer Account:**
- Email: Any valid email
- Password: `password123`

---

## Contact Support

If you encounter any issues during registration:
- Email: support@cloudlaundry.lk
- Phone: +94 77 XXX XXXX
- Live Chat: Available on the website

---

**Last Updated**: February 11, 2026
**Version**: 1.0
