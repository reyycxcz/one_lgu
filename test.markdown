# OneLGU Enterprise System Audit

You are a Senior Software Architect, Security Engineer, DevOps Engineer, QA Engineer, Database Architect, UI/UX Expert, and Government Digital Transformation Consultant.

Your task is to perform a COMPLETE audit of this entire OneLGU project.

DO NOT only review code.

Inspect the ENTIRE project including:

- Folder structure
- Architecture
- Frontend
- Backend
- APIs
- Authentication
- Authorization
- Database
- Components
- Pages
- Server Actions
- Middleware
- Uploads
- Storage
- Security
- Performance
- Accessibility
- Production Readiness

Your goal is to make this system production-ready for an actual Philippine Local Government Unit (LGU).

------------------------------------

# STEP 1

Scan the entire project.

Generate a complete inventory including:

• Pages
• Layouts
• Components
• API Routes
• Server Actions
• Database Models
• Tables
• Middleware
• Authentication
• Utilities
• Hooks
• Context Providers
• Services
• Upload directories
• Public assets
• Environment Variables
• Configuration Files

------------------------------------

# STEP 2

Generate a Feature Matrix.

Categorize every feature under:

Resident

Barangay

LGU

Super Admin

Public Website

Mobile/PWA

For every feature indicate:

✔ Exists

⚠ Partially Implemented

❌ Missing

------------------------------------

# STEP 3

Generate an Authorization Matrix.

Verify every route.

Verify every API.

Verify every server action.

Ensure:

Resident

cannot access

Barangay

LGU

Super Admin

Barangay cannot access LGU.

LGU cannot access Super Admin.

No permission bypass exists.

Every protected route has middleware.

Every API verifies permissions on the server.

Never trust frontend permissions.

------------------------------------

# STEP 4

Audit Authentication.

Verify:

Password hashing

Password complexity

Email verification

Forgot Password

Reset Password

Session timeout

Session rotation

Refresh Tokens

JWT expiration

Secure Cookies

HttpOnly

SameSite

Remember Me

Multiple Sessions

Logout

Device Sessions

Brute Force Protection

------------------------------------

# STEP 5

Audit API Security.

Check every endpoint for:

Authentication

Authorization

Input Validation

Output Validation

SQL Injection

NoSQL Injection

Mass Assignment

IDOR

XSS

CSRF

SSRF

Open Redirect

Path Traversal

Command Injection

Sensitive Data Exposure

Information Leakage

Unsafe Error Messages

Proper HTTP Status Codes

REST Standards

------------------------------------

# STEP 6

Rate Limiting

Identify every endpoint without rate limiting.

Recommend limits.

Examples

Login

5/min

Forgot Password

3/15min

Certificate Request

10/hour

QR Verification

30/min

Resident Search

60/min

Admin Dashboard

120/min

Exports

5/hour

Uploads

10/hour

------------------------------------

# STEP 7

Input Validation

Check every form.

Ensure validation exists both client-side and server-side.

Validate:

Names

Emails

Phone Numbers

Addresses

Birthdates

Certificate Purpose

Uploads

IDs

Search Inputs

URL Params

Query Params

JSON Bodies

------------------------------------

# STEP 8

File Upload Security

Verify:

Allowed MIME Types

Allowed Extensions

Max File Size

Random Filenames

Virus Scan Ready

Storage Outside Public Root

Image Validation

Duplicate Protection

Overwrite Protection

Executable Upload Prevention

------------------------------------

# STEP 9

Database Audit

Inspect:

Relations

Indexes

Foreign Keys

Unique Constraints

Nullable Fields

Duplicate Columns

Normalization

Transactions

Soft Deletes

Audit Tables

N+1 Queries

Slow Queries

Pagination

Sorting

Filtering

Caching

------------------------------------

# STEP 10

Logging

Verify logs exist for:

Login

Logout

Failed Login

Certificate Requests

Certificate Approval

Certificate Rejection

Role Changes

Permission Changes

Profile Updates

Settings Changes

Deleted Records

System Errors

------------------------------------

# STEP 11

Audit Trail

Verify:

Who

When

Where

Old Value

New Value

Affected Record

IP Address

Browser

Device

Reason

------------------------------------

# STEP 12

Frontend Audit

Check:

Responsive Design

Loading States

Empty States

Error States

Skeletons

Broken Links

Unused Components

Duplicate Components

Dark Mode

Accessibility

Animations

SEO

Performance

------------------------------------

# STEP 13

Accessibility

Verify WCAG.

Check:

ARIA

Alt Text

Keyboard Navigation

Tab Order

Screen Reader Support

Heading Structure

Labels

Focus States

Contrast Ratio

------------------------------------

# STEP 14

Performance

Analyze:

Bundle Size

Images

Fonts

Lazy Loading

Code Splitting

Dynamic Imports

Caching

Compression

Hydration

React Rendering

Memory Leaks

Server Components

Client Components

------------------------------------

# STEP 15

Security Headers

Verify:

CSP

HSTS

Referrer Policy

Permissions Policy

X-Frame-Options

X-Content-Type-Options

CORS

------------------------------------

# STEP 16

Environment Variables

Check:

Secrets

API Keys

Database URLs

JWT Secrets

Firebase Keys

Supabase Keys

SMTP

Storage Credentials

Ensure:

Nothing sensitive is committed to Git.

------------------------------------

# STEP 17

Government Compliance

Verify compliance with:

RA 10173 Data Privacy Act

Least Privilege

Resident Privacy

Audit Logging

Data Retention

Encryption

Secure File Storage

Administrative Accountability

------------------------------------

# STEP 18

Code Quality

Detect:

Unused Files

Unused Components

Unused Imports

Duplicate Logic

Large Components

Large Files

Magic Numbers

Hardcoded URLs

Hardcoded Credentials

Technical Debt

TODO

FIXME

Dead Code

------------------------------------

# STEP 19

Generate Missing Features Checklist

Resident

☐ Registration

☐ Login

☐ Profile

☐ Certificate Requests

☐ Notifications

☐ QR Verification

☐ Request History

Barangay

☐ Dashboard

☐ Residents

☐ Certificates

☐ Reports

☐ Audit Logs

☐ Settings

LGU

☐ Dashboard

☐ Municipality Reports

☐ Barangay Management

☐ User Management

☐ Analytics

☐ System Logs

☐ Backups

☐ Settings

Super Admin

☐ Global Dashboard

☐ LGU Management

☐ Roles

☐ Permissions

☐ Logs

☐ Monitoring

☐ Maintenance Mode

------------------------------------

# STEP 20

Output

Generate a complete markdown report.

Use this format.

# Executive Summary

# Overall Architecture

# Security Findings

Critical

High

Medium

Low

# Missing Features

# Missing Permissions

# Missing Validation

# Missing Rate Limits

# Missing Middleware

# Database Improvements

# API Improvements

# Performance Improvements

# UI Improvements

# Accessibility Improvements

# Government Compliance

# Production Readiness

# Action Plan

Critical

High

Medium

Low

# Overall Score

Security

Architecture

Performance

Frontend

Backend

Database

Accessibility

Scalability

Maintainability

Production Readiness

Government Readiness

Overall Score (/100)

For every issue found:

- Explain why it is a problem.
- Explain the security or business impact.
- Point to the affected file(s).
- Recommend the best solution.
- Generate production-ready code when applicable.

Never skip anything.

Assume this system will be deployed to thousands of residents and government employees.