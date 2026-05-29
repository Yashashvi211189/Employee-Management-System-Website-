# Employee Dashboard & Admin Approval System - Integration Guide

## Overview

This guide documents the complete employee dashboard system, including employee profiles, leave management, overtime requests, document submission, and admin approval workflows.

---

## 📁 Project Structure

### Employee Pages

```
app/
├── employee/
│   ├── login/
│   │   └── page.tsx                 # Employee login & profile management
│   ├── dashboard/
│   │   └── page.tsx                 # Main employee dashboard with stats & tabs
│   ├── leaves/
│   │   └── [id]/
│   │       └── page.tsx             # Individual leave request details
│   ├── overtime/
│   │   └── [id]/
│   │       └── page.tsx             # Individual overtime request details (with 2 text fields)
│   └── documents/
│       └── [id]/
│           └── page.tsx             # Individual document details & verification
```

### Admin Pages

```
app/
└── admin1/
    └── dashboard/
        └── page.tsx                 # Admin dashboard with tabs for:
                                           # - Employees
                                           # - Leave Requests (pending, approve, reject)
                                           # - Overtime Requests (with extra pay)
                                           # - Employee Documents (verify, reject)
```

### Admin Components

```
components/
└── admin/
    └── EmployeeRequestsManager.tsx  # Reusable components for:
                                     # - LeaveRequestsManager
                                     # - OvertimeRequestsManager
                                     # - DocumentsManager
```

---

## 🔄 Employee Workflow

### 1. Employee Sign-Up & Verification

**Flow:**
1. Employee signs up with phone/email or login credentials
2. System sends OTP to verify identity
3. After OTP verification, employee profile is created with status "Verified"
4. Employee receives sign-in options and can now access dashboard
5. Profile shows as "Active" or other status

**API Endpoints:**
```
POST /api/employee/login/request/              # Request OTP
POST /api/employee/otp/verify/                 # Verify OTP & create/activate profile
POST /api/employee/otp/resend/                 # Resend OTP
POST /api/employee/register/                   # Alternative registration
POST /api/employee/login/                      # Legacy login without OTP
```

**Backend Structure:**
- Model: `EmployeeProfile` with status field
- Model: `OTPVerification` for handling OTP flow
- Views: Employee authentication views with OTP handling

---

### 2. Employee Dashboard (`/employee/dashboard`)

**Features:**
- **Profile Management**: View and edit profile information (Name, Location, Qualification)
- **Quick Stats**: Display dashboard metrics:
  - Leaves Taken (with count)
  - Remaining Leaves
  - Pending Requests (sum of all pending)
  - Approved Overtime Hours
  - Verified Documents

**Tabs:**
- **Profile**: Edit personal information
- **Leaves**: View all leave requests with status
- **Overtime**: View all overtime requests with status
- **Documents**: View submitted documents
- **Summary**: Leave balance & overtime summary

**API Endpoints:**
```
GET /api/employees/me/                         # Get current employee profile
PATCH /api/employees/{id}/                     # Update employee profile
GET /api/leave-requests/?employee={id}         # Get employee's leave requests
GET /api/overtime-requests/?employee={id}      # Get employee's overtime requests
GET /api/employee-documents/?employee={id}     # Get employee's documents
GET /api/leave-balance/                        # Get leave balance info
```

---

### 3. Leave Management

#### Employee Leave Request Form
- **Leave Type**: Sick, Casual, Earned, Other
- **Dates**: Start date, End date
- **Reason**: Text field with description
- **Auto-calculate**: Days count between dates
- **Status**: Pending → Approved/Rejected

#### Leave Details Page (`/employee/leaves/[id]`)
- View complete leave request details
- Check approval status
- See rejection reason if rejected
- Cancel request if still pending
- View leave balance by type
- Timeline of request lifecycle

**API Endpoints:**
```
GET /api/leave-requests/{id}/                  # Get specific leave request
POST /api/leave-requests/                      # Create new leave request
PATCH /api/leave-requests/{id}/                # Update leave request
DELETE /api/leave-requests/{id}/               # Cancel leave request
GET /api/leave-balance/                        # Get leave balance info
```

---

### 4. Overtime Management

#### Overtime Request Form
- **Date**: When the overtime was done
- **Hours**: Number of overtime hours (0.5 step)
- **Reason**: Brief reason for overtime

#### Overtime Details Page (`/employee/overtime/[id]`)

**Two Text Fields for Extra Pay Justification:**

1. **"Work Completed / Work Description"** (max 500 words)
   - Describe what work was completed
   - Specific tasks and deliverables
   - Why extra time was needed
   - Performance metrics if applicable

2. **"Additional Details / Justification for Extra Pay"** (max 500 words)
   - Additional context about the work
   - Project urgency and deadlines
   - Client requirements met
   - Business impact
   - Justification for the requested pay

**Features:**
- Word count validation (max 500 words per field)
- Editable only when status is "pending"
- View submission history
- Status tracking (Pending → Approved with ₹amount → Rejected)

**API Endpoints:**
```
GET /api/overtime-requests/{id}/               # Get specific overtime request
POST /api/overtime-requests/                   # Create new overtime request
PATCH /api/overtime-requests/{id}/             # Update overtime request (edit descriptions)
GET /api/overtime-requests/?employee={id}      # Get employee's overtime requests
```

**Data Model:**
```python
class OvertimeRequest:
    id: str
    employee: ForeignKey(Employee)
    date: DateField
    hours: DecimalField
    reason: TextField
    work_description_1: CharField(max_length=1000)  # Up to 500 words
    work_description_2: CharField(max_length=1000)  # Up to 500 words
    status: 'pending' | 'approved' | 'rejected'
    extra_pay: DecimalField (nullable, only when approved)
    extra_pay_per_hour: DecimalField (nullable)
    rejection_reason: TextField (optional)
    created_at: DateTime
    updated_at: DateTime
```

---

### 5. Document Management

#### Employee Document Submission
- **Title**: Name of the document
- **Document Type**: Choose from predefined types
  - ID Proof
  - Address Proof
  - Qualification Certificate
  - Experience Certificate
  - Joining Document
  - Resume
  - Professional License
  - Other

- **Description**: Optional additional info about the document
- **File Upload**: PDF, DOC, DOCX, JPG, PNG

#### Document Details Page (`/employee/documents/[id]`)
- **Edit Details**: Only when pending (title, type, description)
- **File Information**: Name, size, upload date
- **File Preview**: View/download capability
- **Timeline**: Upload → Verification/Rejection
- **Status**: Pending → Verified/Rejected

**Features:**
- Inline file preview for images and PDFs
- Download file button
- View verification details if reviewed
- See rejection reason if rejected
- Delete documents if pending

**API Endpoints:**
```
GET /api/employee-documents/{id}/              # Get specific document
POST /api/employee-documents/                  # Upload new document
PATCH /api/employee-documents/{id}/            # Update document info
DELETE /api/employee-documents/{id}/           # Delete pending document
GET /api/employee-documents/?employee={id}     # Get employee's documents
```

**Data Model:**
```python
class EmployeeDocument:
    id: str
    employee: ForeignKey(Employee)
    title: CharField
    description: TextField (optional)
    document_type: CharField (choices)
    file: FileField
    file_name: CharField
    file_size: IntegerField
    status: 'pending' | 'verified' | 'rejected'
    uploaded_at: DateTime
    verified_at: DateTime (optional)
    verified_by: ForeignKey(Admin) (optional)
    rejection_reason: TextField (optional)
```

---

## 👨‍💼 Admin Approval Workflow

Admin dashboard location: `/admin1/dashboard`

### Admin Dashboard Tabs (Already Configured)

The admin dashboard has these tabs in the sidebar:
- ✅ Team
- ✅ Employees
- ✅ Projects
- ✅ Services
- ✅ GIS Services
- ✅ Products
- ✅ Testimonials
- ✅ Gallery
- ✅ Blog
- ✅ **Leave Requests** ← Admin approval interface
- ✅ **Overtime Requests** ← Admin approval interface
- ✅ **Employee Documents** ← Admin verification interface

### 1. Leave Requests Manager Component

**Location**: `components/admin/EmployeeRequestsManager.tsx` - `LeaveRequestsManager` export

**Features:**
- **Search & Filter**:
  - Search by employee name or ID
  - Filter by status (All, Pending, Approved, Rejected)
  - Shows count of matching requests

- **Request Card Display**:
  - Employee avatar, name, ID
  - Leave type badge (sick, casual, earned, other)
  - Status badge (yellow=pending, green=approved, red=rejected)
  - Start date, End date, Total days
  - Reason text

- **Admin Actions** (only for pending requests):
  - **Approve**: Instantly approves the request
  - **Reject**: Opens textarea for rejection reason
  - Can only be rejected with a reason

- **Post-Decision View**:
  - Shows rejection reason if rejected
  - Cannot change decision once made
  - Shows timeline of actions

**Integration in Admin Dashboard:**
```tsx
// In TabsContent value="leave-requests":
<LeaveRequestsManager
  requests={leaveRequests}
  isLoading={isProcessing}
  onApprove={handleApproveLea}
  onReject={handleRejectLeave}
/>
```

### 2. Overtime Requests Manager Component

**Location**: `components/admin/EmployeeRequestsManager.tsx` - `OvertimeRequestsManager` export

**Features:**
- **Request Card Display**:
  - Employee info with avatar
  - Date and hours worked
  - Two work descriptions displayed in full
  - Status with badge
  - Current extra pay amount (if approved)

- **Admin Actions** (only for pending requests):
  - **Approve**: Opens input field for "Extra Pay Amount (₹)"
    - Input field to specify amount
    - Shows "Approve with ₹{amount}" button
    - Saves extra_pay to database on approval
  
  - **Reject**: Opens textarea for rejection reason
    - Must provide reason text
    - Cannot approve/reject without reason

- **Pre-populated Data Display**:
  - Shows both work descriptions from employee submission
  - Word count was already validated by employee

**Integration in Admin Dashboard:**
```tsx
// In TabsContent value="overtime-requests":
<OvertimeRequestsManager
  requests={overtimeRequests}
  isLoading={isProcessing}
  onApprove={handleApproveOvertime}  // (id, extraPay) => Promise
  onReject={handleRejectOvertime}    // (id, reason) => Promise
/>
```

### 3. Documents Manager Component

**Location**: `components/admin/EmployeeRequestsManager.tsx` - `DocumentsManager` export

**Features:**
- **Search & Filter**:
  - Search by employee name, ID, or document title
  - Filter by document type (dynamic list)
  - Filter by status (All, Pending, Verified, Rejected)

- **Document Card Display** (Grid Layout):
  - Document title and employee name
  - Status badge
  - Document type
  - Upload date
  - Description (truncated)
  - File size and name

- **File Interactions**:
  - **Preview Button**: Opens inline preview for images/PDFs
  - **Download Button**: Direct download link to file
  - Preview toggle shows/hides the document inside card

- **Admin Actions** (only for pending documents):
  - **Verify**: One-click verification
    - Updates status to "verified"
    - Records verification timestamp
    - Shows verified admin
  
  - **Reject**: Opens textarea for rejection reason
    - Must provide reason
    - Reason saved to rejection_reason field
    - Cannot verify/reject without reason

- **Post-Decision**:
  - Shows rejection reason for rejected documents
  - Shows verification timestamp for verified documents
  - Shows who verified it (admin name)

**Integration in Admin Dashboard:**
```tsx
// In TabsContent value="employee-docs":
<DocumentsManager
  requests={employeeDocuments}
  isLoading={isProcessing}
  onVerify={handleVerifyDocument}   // (id) => Promise
  onReject={handleRejectDocument}   // (id, reason) => Promise
/>
```

---

## 📊 Admin Statistics

The admin dashboard shows key metrics in cards:
- Total Employees
- Total Leave Requests
- Total Overtime Requests
- Total Documents Submitted
- Pending Approvals Count
- Verified Documents Count

---

## 🔌 Backend API Integration

### Required Backend Endpoints

All endpoints require JWT authentication (Bearer token in Authorization header).

#### Employee Endpoints
```
GET    /api/employees/me/                           # Current user profile
GET    /api/employees/                              # List all employees
POST   /api/employees/                              # Create employee
PATCH  /api/employees/{id}/                         # Update employee
GET    /api/employees/{id}/                         # Get employee details
```

#### Leave Request Endpoints
```
GET    /api/leave-requests/                         # List all (with filters)
GET    /api/leave-requests/{id}/                    # Get specific request
POST   /api/leave-requests/                         # Create request
PATCH  /api/leave-requests/{id}/                    # Update request
DELETE /api/leave-requests/{id}/                    # Cancel request
GET    /api/leave-balance/                          # Get balance info
```

**Expected Response:**
```json
{
  "id": "uuid",
  "employee": "uuid",
  "employee_name": "string",
  "leave_type": "sick|casual|earned|other",
  "start_date": "2024-03-01",
  "end_date": "2024-03-05",
  "days_count": 5,
  "reason": "string",
  "status": "pending|approved|rejected",
  "rejection_reason": "string (optional)",
  "created_at": "2024-02-27T10:00:00Z",
  "updated_at": "2024-02-27T10:00:00Z"
}
```

#### Overtime Request Endpoints
```
GET    /api/overtime-requests/                      # List all
GET    /api/overtime-requests/{id}/                 # Get specific
POST   /api/overtime-requests/                      # Create request
PATCH  /api/overtime-requests/{id}/                 # Update request
```

**Expected Response:**
```json
{
  "id": "uuid",
  "employee": "uuid",
  "employee_name": "string",
  "date": "2024-02-27",
  "hours": 3.5,
  "reason": "string",
  "work_description_1": "string (up to 500 words)",
  "work_description_2": "string (up to 500 words)",
  "status": "pending|approved|rejected",
  "rejection_reason": "string (optional)",
  "extra_pay": 1500,
  "extra_pay_per_hour": 428.57,
  "created_at": "2024-02-27T10:00:00Z",
  "updated_at": "2024-02-27T10:00:00Z"
}
```

#### Document Endpoints
```
GET    /api/employee-documents/                     # List all
GET    /api/employee-documents/{id}/                # Get specific
POST   /api/employee-documents/                     # Upload document
PATCH  /api/employee-documents/{id}/                # Update document info
DELETE /api/employee-documents/{id}/                # Delete document
```

**Expected Response:**
```json
{
  "id": "uuid",
  "employee": "uuid",
  "employee_name": "string",
  "title": "string",
  "description": "string",
  "document_type": "ID Proof|Address Proof|...",
  "file": "/media/documents/...",
  "file_name": "document.pdf",
  "file_size": 204800,
  "status": "pending|verified|rejected",
  "rejection_reason": "string (optional)",
  "uploaded_at": "2024-02-27T10:00:00Z",
  "verified_at": "2024-02-28T10:00:00Z (optional)",
  "verified_by": "admin_name (optional)"
}
```

---

## 🚀 Backend Activation Steps

To activate the employee and admin systems in the backend:

### 1. Navigate to Backend Directory
```bash
cd C:\Users\Oppen\OneDrive\Desktop\Backend\Diracai_Backend_Employee_Management_mine
```

### 2. Activate Virtual Environment
```bash
venv311\Scripts\activate
```

### 3. Check/Create Models
Ensure these models exist in `account/employee_models.py`:
- `EmployeeProfile` - For employee profile data
- `OTPVerification` - For OTP verification flow
- `LeaveRequest` - For leave management
- `OvertimeRequest` - For overtime management
- `EmployeeDocument` - For document management

### 4. Create Serializers
Ensure serializers exist in `account/employee_serializers.py`:
- `EmployeeProfileSerializer`
- `LeaveRequestSerializer`
- `OvertimeRequestSerializer`
- `EmployeeDocumentSerializer`

### 5. Create ViewSets/Views
Ensure views exist in `account/employee_views.py`:
- `EmployeeLoginRequestView` - OTP request
- `EmployeeOTPVerifyView` - OTP verification
- `EmployeeLoginView` - Direct login
- `LeaveRequestViewSet` - CRUD for leaves
- `OvertimeRequestViewSet` - CRUD for overtime
- `EmployeeDocumentViewSet` - CRUD for documents

### 6. Update URLs
Ensure routes are configured in `account/employee_urls.py` and main `urls.py`

### 7. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 8. Restart Backend Server
```bash
python manage.py runserver
```

---

## 📋 Frontend Environment Setup

### 1. Environment Variables
Ensure `.env.local` or next.config includes:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 2. Authentication Context
Uses `AuthContext` from `context/AuthContext.js`:
- Manages JWT tokens
- Provides user information
- Handles login/logout

### 3. API Configuration
Uses `lib/config.js`:
- `API_URL` points to backend
- Add auth headers via `useAuth` hook

---

## ✅ Testing Checklist

### Employee Flow
- [ ] Employee can sign up with OTP verification
- [ ] Profile shows as verified after OTP
- [ ] Can access `/employee/dashboard`
- [ ] Can submit leave request
- [ ] Can submit overtime request with descriptions
- [ ] Can upload documents
- [ ] Can view individual request details
- [ ] Can edit pending requests only
- [ ] Can cancel pending requests
- [ ] Dashboard stats update correctly

### Admin Flow
- [ ] Admin can see all leave requests in admin dashboard
- [ ] Can search and filter leave requests
- [ ] Can approve/reject leave with reason
- [ ] Can see all overtime requests with descriptions
- [ ] Can approve overtime and set extra pay amount
- [ ] Can reject overtime with reason
- [ ] Can see all documents and preview them
- [ ] Can verify documents
- [ ] Can reject documents with reason
- [ ] All changes reflect immediately in UI

### Calendar Integration (Future)
- [ ] Approved leaves show in employee calendar
- [ ] Leave balance updates after approval
- [ ] Monthly leave count updates

---

## 📝 Notes

1. **Word Count Validation**: Overtime descriptions are validated client-side (max 500 words each field). Backend should also validate.

2. **File Upload**: Documents support PDF, DOC, DOCX, JPG, PNG. Backend should validate file types and sizes.

3. **File Preview**: Only images and PDFs can be previewed inline. Other files show download button only.

4. **Rejection Workflow**: Once rejected, admin must see the rejection reason. Employees cannot override admin decisions.

5. **Leave Balance**: Should be fetched from backend and displayed in:
   - Employee dashboard summary tab
   - Leave details page
   - Leave request form (for reference)

6. **Extra Pay Calculation**: Admin manually enters extra pay amount during approval. Consider backend helper function to calculate based on hourly rate.

7. **Timeline**: All requests show creation and review timestamps automatically.

8. **Email Notifications**: Consider adding:
   - Approval/rejection emails to employees
   - New request notifications to admin

---

## 🔗 Related Files

- Frontend Dashboard: `app/employee/dashboard/page.tsx`
- Admin Dashboard: `app/admin1/dashboard/page.tsx`
- Employee Login: `app/employee/login/page.tsx`
- Components: `components/admin/EmployeeRequestsManager.tsx`
- Auth Context: `context/AuthContext.js`
- Config: `lib/config.js`

---

## 🎯 Future Enhancements

1. **Leave Calendar**: Display approved leaves on calendar
2. **Attendance Tracking**: Link OTP-based sign-in to attendance
3. **Expense Management**: Track overtime pay and expenses
4. **Reports**: Generate leave and overtime reports
5. **Notifications**: Email/SMS for approvals and rejections
6. **Mobile App**: Mobile view for employee requests
7. **Analytics**: Dashboard analytics for admin
8. **Batch Approvals**: Bulk approve/reject multiple requests
9. **Comments**: Admin comments on rejections
10. **Approval Workflow**: Multi-level approval (Manager → Director → Admin)

---

**Last Updated**: February 27, 2026
**System Version**: 2.0
