# 🚀 Enterprise Employee Management System & Digital Workplace Platform

<div align="center">

### Modern Workforce Management • Project Collaboration • HR Operations • Company CMS

Built with **Django REST Framework**, **Next.js**, **PostgreSQL**, and **TypeScript**

![Django](https://img.shields.io/badge/Django-3.2-092E20?logo=django\&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql)
![JWT](https://img.shields.io/badge/JWT-Authentication-success)
![Tailwind](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss)

</div>

---

# 🌟 Overview

Managing employees, projects, documents, approvals, support requests, and company content across multiple systems creates operational inefficiencies.

This platform unifies all critical workforce operations into a single digital ecosystem, enabling organizations to manage employees, streamline workflows, monitor projects, handle support requests, and maintain company content from one centralized dashboard.

Whether you're onboarding a new employee, tracking project progress, approving leave requests, managing internal tickets, or publishing website content, everything happens in one platform.

---

# ✨ Core Capabilities

<table>
<tr>
<td width="50%">

### 👥 Workforce Management

* Employee onboarding
* Employee profiles
* Department management
* Role-based permissions
* Employee lifecycle tracking

</td>

<td width="50%">

### 📂 Document Management

* Secure document uploads
* Employee records
* Verification workflows
* Centralized storage

</td>
</tr>

<tr>
<td>

### 📅 Leave & Attendance

* Leave requests
* Approval workflows
* Leave balances
* Overtime management

</td>

<td>

### 🎫 Support Ticketing

* Ticket creation
* Assignment workflows
* Comments & discussions
* Status tracking

</td>
</tr>

<tr>
<td>

### 🚀 Project Management

* Project assignments
* Team memberships
* Daily updates
* Progress tracking

</td>

<td>

### 🌐 Website CMS

* Blogs
* Services
* Testimonials
* Team Pages
* Product Catalog

</td>
</tr>
</table>

---

# 🎯 Business Value

Organizations typically use multiple disconnected systems for HR, project tracking, document management, and content publishing.

This platform consolidates them into a single solution.

### Benefits

✅ Reduced operational overhead

✅ Faster onboarding processes

✅ Improved employee visibility

✅ Better project accountability

✅ Centralized information management

✅ Enhanced collaboration across teams

✅ Scalable enterprise architecture

---

# 🏆 Highlights

| Metric           | Achievement               |
| ---------------- | ------------------------- |
| APIs Developed   | 50+ REST APIs             |
| Authentication   | JWT + Role Based Access   |
| Documentation    | Swagger + Redoc + OpenAPI |
| Frontend         | Next.js 14 + TypeScript   |
| Backend          | Django REST Framework     |
| Database         | PostgreSQL                |
| Deployment Ready | Nginx + Gunicorn + Vercel |

---

# 🖼️ Product Walkthrough

## Employee Portal

* Employee Dashboard
* Profile Management
* Leave Requests
* Overtime Requests
* Ticket Tracking
* Project Updates

![Employee Dashboard](screenshots/employee-dashboard.png)

---

## Administration Portal

* Employee Management
* Approvals
* Project Oversight
* Ticket Administration
* Website Content Management

![Admin Dashboard](screenshots/admin-dashboard.png)

---

## Project Management Workspace

* Team Collaboration
* Daily Reporting
* Assignment Tracking
* Private Projects

![Projects](screenshots/projects.png)

---

# 🏗️ Architecture

```text
                Internet
                    │
                    ▼
                NGINX
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
 Next.js Frontend       Django REST API
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
     PostgreSQL            SMTP Services          S3 Storage
      Database              Email System          File Assets
```

---

# 🔐 Security Architecture

### Authentication

* JWT Access Tokens
* Refresh Tokens
* Secure Cookie Support
* Role-Based Authorization

### Data Protection

* Protected APIs
* Permission-Based Access
* Secure File Storage
* Environment-Based Configuration

### Integrations

* Email Services
* Twilio OTP Support
* S3-Compatible Storage

---

# 👥 User Experience by Role

## Employee

* Login & Authentication
* Profile Management
* Leave Applications
* Overtime Requests
* Project Participation
* Ticket Creation
* Document Uploads

## HR & Administrators

* Employee Administration
* Leave Approvals
* Overtime Management
* Ticket Resolution
* Website Content Management
* Reporting & Monitoring

## Public Visitors

* Service Pages
* Product Catalog
* Blogs
* Testimonials
* Contact Forms

---

# 🗄️ System Data Model

```text
Employee
│
├── Profile
├── Leave Requests
├── Overtime Requests
├── Documents
├── Tickets
│    └── Comments
│
└── Project Memberships

Project
│
├── Members
├── Assignments
├── Daily Updates
└── Plans
```

---

# 📡 API Ecosystem

## Authentication

```http
POST /api/login/
POST /api/token/
POST /api/token/refresh/
```

## Employee Management

```http
GET    /api/employees/
POST   /api/employees/
GET    /api/employee/me/
```

## Project Management

```http
GET /api/projects/
GET /api/project-memberships/
```

## Content Management

```http
GET /api/services/
GET /api/blogs/
GET /api/products/
```

---

# 🛠 Technology Stack

### Backend

* Django
* Django REST Framework
* Simple JWT
* Channels
* drf-spectacular

### Frontend

* Next.js 14
* React 18
* TypeScript
* Tailwind CSS
* Radix UI

### Infrastructure

* PostgreSQL
* Nginx
* Gunicorn
* AWS S3
* SMTP Services

---

# 🚀 Quick Start

```bash
# Backend

cd backend

python -m venv .venv

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

```bash
# Frontend

cd frontend

npm install

npm run dev
```

---

# 🔮 Future Roadmap

### Phase 1

* Real-Time Notifications
* WebSocket Updates
* Dashboard Analytics

### Phase 2

* AI HR Assistant
* Smart Employee Insights
* Automated Ticket Classification

### Phase 3

* Mobile Application
* Attendance Tracking
* Payroll Integrations

---

# 🤝 Contributing

Contributions are welcome.

Please submit issues, feature requests, or pull requests to help improve the platform.

---

# 📄 License

MIT License

---

<div align="center">

### Built for Modern Organizations

Empowering HR Teams • Employees • Project Managers • Business Operations

⭐ Star the repository if you found it useful.

</div>
