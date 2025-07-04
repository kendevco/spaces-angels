# 🗄️ PostgreSQL Database Integration Guide

*Multi-Tenant Database Architecture - Production-Grade Scaling*

## 📊 Overview

PostgreSQL serves as the primary database for the Spaces Commerce platform, providing multi-tenant data isolation, robust ACID compliance, and scalable performance. Our external database server (74.208.87.243:5432) ensures compatibility with Vercel deployments and supports enterprise-grade workloads.

## 🏗️ **What Goes In vs What Goes Out**

### **INPUT (What We Send to PostgreSQL):**

#### **Connection Configuration**
`	ypescript
interface PostgreSQLConnection {
  host: string                    // 74.208.87.243 (external server)
  port: number                    // 5432 (default PostgreSQL port)
  database: string                // spaces_commerce
  username: string                // postgres (superuser) / spaces_commerce_user
  password: string                // K3nD3v!host / SpacesCommerce2024!
  ssl: boolean                    // true for production
  
  // Connection Pool Settings
  max: number                     // Maximum connections (default: 10)
  idleTimeoutMillis: number      // Idle timeout (default: 30000)
  connectionTimeoutMillis: number // Connection timeout (default: 2000)
  
  // Multi-tenant Schema
  schema?: string                 // tenant-specific schema name
  searchPath?: string[]           // schema search order
}

// Environment Variables
DATABASE_URI="postgresql://spaces_commerce_user:SpacesCommerce2024!@74.208.87.243:5432/spaces_commerce"
`

## 🔧 **Configuration Management**

### **pgAdmin4 Management Interface**
- **Access**: Use pgAdmin4 GUI (installed locally)
- **Server**: 74.208.87.243:5432
- **Credentials**: postgres / K3nD3v!host
- **Note**: psql commands don't work from command line - use GUI for database operations

### **Environment Variables**
`ash
# Production Database (Vercel Compatible)
DATABASE_URI="postgresql://postgres:K3nD3v!host@74.208.87.243:5432/spaces_commerce"

# Development Database (Local)
DATABASE_URI="postgresql://spaces_commerce_user:SpacesCommerce2024!@localhost:5432/spaces_commerce"
`

---

*This PostgreSQL integration provides enterprise-grade database capabilities for the Spaces Commerce platform, ensuring data integrity, performance, and scalability for multi-tenant operations.*
