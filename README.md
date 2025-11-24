# DelhiveryWay Admin Portal 🚀

**The Command Center for the DelhiveryWay Platform**

The DelhiveryWay Admin Portal is a robust, modular administrative interface designed to empower platform managers with complete control over the delivery ecosystem. From real-time order tracking to comprehensive vendor management, this application serves as the central nervous system for operations.

## ✨ Key Features

*   **📊 Interactive Dashboard**
    *   Real-time overview of platform health.
    *   Key metrics: Active Orders, Revenue, Active Shoppers, and more.
    *   Visual data representation for quick decision-making.

*   **📦 Advanced Order Management**
    *   Full lifecycle tracking: Pending -> Shopping -> Delivery -> Completed.
    *   Detailed order views with item-level specifics.
    *   Ability to intervene and update order statuses manually.

*   **🛍️ Shop & Vendor Management**
    *   Onboard new shops and manage existing profiles.
    *   Configure operating hours, locations, and delivery zones.
    *   Toggle shop availability instantly.

*   **🛒 Product Catalog System**
    *   Centralized management of the global product database.
    *   Bulk import/export capabilities using Excel (XLSX).
    *   Category and sub-category organization.

*   **🏃 Personal Shopper Coordination**
    *   Manage shopper profiles and verification status.
    *   Track shopper performance and ratings.
    *   Approve or reject shopper applications.

*   **👥 Customer Management**
    *   View customer profiles and order history.
    *   Manage account statuses and support inquiries.

*   **💬 Communication Hub**
    *   Integrated messaging for platform-wide announcements.
    *   Direct communication channels with shoppers and vendors.

*   **⚙️ System Configuration**
    *   Global settings for delivery fees, taxes, and commissions.
    *   Role-based access control (RBAC) for secure administration.

## 🛠️ Technology Stack

Built with modern web technologies for performance and scalability:

*   **Frontend Framework**: [React 19](https://react.dev/) - The latest in component-based UI development.
*   **Routing**: [React Router v7](https://reactrouter.com/) - Robust client-side routing.
*   **State Management**: React Context API & Hooks.
*   **HTTP Client**: [Axios](https://axios-http.com/) - For efficient API communication.
*   **Data Processing**: [SheetJS (xlsx)](https://sheetjs.com/) - For handling spreadsheet data.
*   **Styling**: Modular CSS - Scoped styling for component isolation.
*   **Architecture**: Feature-based Modular Architecture.

## 🚀 Getting Started

Follow these steps to set up the admin portal locally.

### Prerequisites

*   **Node.js**: v16.0.0 or higher
*   **npm** or **yarn**

### Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/your-org/delhiveryway.git
    cd delhiveryway/client-admin
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root of `client-admin` based on the example:
    ```bash
    cp env.example .env
    ```
    
    Update the values in `.env` to match your backend configuration:
    ```env
    CI=false
    REACT_APP_BACKEND_URL="http://localhost:5000"
    REACT_APP_SOCKET_URL="http://localhost:5000"
    REACT_APP_API_URL="http://localhost:5000/api"
    ```

4.  **Start the Development Server**:
    ```bash
    npm start
    ```
    The application will launch automatically at `http://localhost:3000`.

## 📂 Project Structure

The codebase follows a strictly modular architecture, ensuring that features are encapsulated and easy to maintain.

```
client-admin/
├── public/                 # Static assets (Manifest, Icons)
├── src/
│   ├── modules/            # Feature Modules
│   │   ├── auth/           # Login & Authentication
│   │   ├── core/           # Shared Components (Layout, Sidebar, Navbar)
│   │   ├── dashboard/      # Analytics & Overview
│   │   ├── orders/         # Order Processing Logic
│   │   ├── products/       # Product Management
│   │   ├── settings/       # Platform Configuration
│   │   ├── shoppers/       # Shopper Management
│   │   ├── shops/          # Vendor Management
│   │   └── users/          # Customer Management
│   ├── App.js              # Main Application Entry
│   ├── index.js            # React DOM Rendering
│   └── index.css           # Global Styles
├── .env                    # Environment Variables
├── package.json            # Dependencies & Scripts
└── README.md               # Project Documentation
```

## 🔐 Security

*   **Authentication**: JWT-based session management.
*   **Authorization**: Protected routes ensure only authorized admins can access sensitive modules.

---

*© 2025 DelhiveryWay. All rights reserved.*
