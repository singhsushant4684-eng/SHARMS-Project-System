# 🏠 SHARMS — Smart Home Automation & Resource Management System

**SHARMS** is a full-stack, centralized web application designed for smart home monitoring, device automation, and resource management. It provides real-time tracking of connected household devices, resource consumption monitoring, secure multi-user access control, and complete audit logging.

## 🌟 Key Features

* **Device Control & Automation**: Real-time management and state toggling for smart home appliances and sensors.

* **Resource Monitoring**: Analytics and usage tracking for household power, energy, and resource consumption.

* **Role-Based Access Control (RBAC)**: Secure user authentication and session management built with `bcrypt` encryption.

* **System Audit Logging**: Comprehensive, timestamped logging of all system events, user actions, and device state changes for security and auditing.

* **Responsive Dashboard Interface**: Clean, modern frontend designed for seamless control across desktop and mobile browsers.

## 🛠️ Tech Stack

### **Frontend**

* **HTML5 / CSS3 / JavaScript (ES6+)**: Core user interface and layout design.

* **REST API Integration**: Asynchronous `fetch` calls for dynamic data updates without page reloads.

### **Backend**

* **Node.js**: JavaScript runtime environment.

* **Express.js**: Framework for handling RESTful API routes and middleware.

* **bcrypt**: Password hashing and authentication safeguards.

### **Database**

* **MongoDB**: NoSQL database for flexible storage of user credentials, device states, and audit log records.

## 📐 System Architecture

```
[ Client Browser UI ] 
        │
   (HTTPS / JSON)
        │
        ▼
[ Node.js + Express API Gateway ]
   ├── Authentication Middleware (bcrypt)
   ├── Audit Logging Controller
   └── Resource Data Handlers
        │
        ▼
  [ MongoDB Database ]
   ├── Users Collection
   ├── Devices Collection
   └── AuditLogs Collection

```

## 🔌 API Endpoints Reference

### **Authentication**

| Method | Endpoint | Description | 
| ----- | ----- | ----- | 
| `POST` | `/api/auth/register` | Register a new user account | 
| `POST` | `/api/auth/login` | Authenticate user credentials | 

### **Device & Resource Management**

| Method | Endpoint | Description | 
| ----- | ----- | ----- | 
| `GET` | `/api/devices` | Retrieve state of all registered smart devices | 
| `PUT` | `/api/devices/:id` | Update individual device status or power state | 
| `GET` | `/api/resources/usage` | Fetch real-time resource consumption metrics | 

### **Audit Logs**

| Method | Endpoint | Description | 
| ----- | ----- | ----- | 
| `GET` | `/api/logs` | Fetch system audit logs (Admin only) | 


## 🛡️ Security Highlights

* Passwords are salt-hashed using **bcrypt** before storage; plain text passwords are never stored in the database.

* All sensitive API actions pass through server-side validation and write corresponding entries to the system audit trail.