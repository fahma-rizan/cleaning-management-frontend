# Cloud Laundry Service Structure

This document outlines the complete service hierarchy used throughout the application.

## Service Hierarchy

### 1. Home/Office Cleaning
**Main Service Type:** `Home/Office Cleaning`

**Service Categories:**
- House Deep Cleaning (ID: 1)
- General Cleaning (ID: 6)
- Commercial Cleaning (ID: 5)
- Floor Cleaning (ID: 7)
- Floor Cut and Polish (ID: 8)

---

### 2. Shampoo and Vacuum Cleaning
**Main Service Type:** `Shampoo and Vacuum Cleaning`

**Service Categories:**
- Sofa Cleaning (ID: 3)
- Mattress Cleaning with Steam (ID: 13)
- Carpet Cleaning (ID: 14)

---

### 3. Curtain Cleaning
**Main Service Type:** `Curtain Cleaning`
**Service ID:** `4`

**Service Sub-Categories (Selected during booking):**
- Dry Cleaning and Pressing (LKR 2,500/curtain)
- Laundry and Pressing (LKR 3,500/curtain)
- Curtain Premium Service (LKR 4,500/curtain)

**Property Details (Options):**
- Curtain Removal (LKR 100/curtain)
- Curtain Installation (LKR 100/curtain)
- Pickup and Delivery (LKR 500 flat)

---

### 4. Laundry
**Main Service Type:** `Laundry`

**Service Categories:**
- General Laundry (ID: 2)
- Dry Cleaning (ID: 9)
- Washing & Pressing (ID: 10)
- Pressing Only (ID: 11)

---

## Data Structure

When a booking is created, it includes:

```typescript
{
  bookingId: string,
  serviceId: string,
  serviceType: string,        // Main service type (e.g., "Home/Office Cleaning")
  serviceCategory: string,     // Service category or sub-service name (e.g., "House Deep Cleaning" or "Dry Cleaning and Pressing")
  serviceName: string,         // Legacy field for compatibility
  date: string,
  time: string,
  address: string,
  price: number,
  status: string,
  curtainQuantity?: number,    // For curtain cleaning
  curtainOptions?: string[],   // For curtain cleaning
  // ... other booking-specific fields
}
```

## Display in Dashboards

### Customer Dashboard
Displays both:
- **Service Type** (Main heading)
- **Service Category** (Sub-category with tag icon)

### Staff Dashboard
Displays the **Service Category** as the primary task name to ensure staff know exactly what service to perform (e.g., "Dry Cleaning and Pressing" instead of just "Curtain Cleaning").
