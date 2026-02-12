# Guest & Payment Tracker

## ✨ Features 

- **Guest Management**: Add, view, and delete wedding guests with detailed information
- **Payment Tracking**: Record payments with multiple methods (Cash, ABA Bank, ACLEDA Bank, Wing, Other)
- **Multi-Currency Support**: Track contributions in both USD and KHR with automatic conversion
- **Real-time Summaries**: See total contributions by currency and grand total at a glance
- **Smart Filtering**: Filter guests by category and currency
- **Modern UI**: Beautiful gradient design with dark mode support
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices




## 🎨 Features Breakdown

### Dashboard (/)
- **Summary Cards**: Display total USD, total KHR, and grand total (converted to USD)
- **Guest List**: View all guests with filtering options
- **Quick Actions**: Add new guest button

### Add Guest (/add)
- **Form Fields**:
  - Name (required)
  - Location (optional)
  - Category (Family, Friend, Colleague, VIP, Other)
  - Payment Method (Cash, ABA, ACLEDA, Wing, Other)
  - Currency (USD, KHR)
  - Amount (number)
  - Note (optional)

### Guest Management
- View detailed guest information
- Filter by category or currency
- Delete guests with confirmation
- Color-coded categories for easy identification

## 💾 Database Schema


model Guest {
  id            Int      @id @default(autoincrement())
  name          String
  location      String?
  category      String
  paymentMethod String
  currency      String
  amount        Float
  note          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
