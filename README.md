# MHD Unified Suite: Full-Stack Portfolio & E-Commerce Ecosystem

<div align="center">

[![Visit Portfolio](https://img.shields.io/badge/LIVE_DEMO-Visit_Portfolio-blueviolet?style=for-the-badge&logo=vercel)](https://github.com/athil18/My-Portfolio)
[![Visit E-Commerce](https://img.shields.io/badge/LIVE_DEMO-Visit_E--Commerce-cyan?style=for-the-badge&logo=stripe)](https://github.com/athil18/My-Portfolio)
[![View Source](https://img.shields.io/badge/GITHUB-View_Source-red?style=for-the-badge&logo=github)](https://github.com/athil18/My-Portfolio)

</div>

---

The **MHD Unified Suite** is a full-stack ecosystem that seamlessly integrates a professional portfolio with a robust, feature-rich e-commerce platform. Designed for the modern web, this suite prioritizes **performance, security, and premium aesthetics**, utilizing a cutting-edge **MERN** (MongoDB, Express, React, Node.js) architecture.

## 🏛️ Project Architecture
The suite is divided into two primary domains, sharing a unified backend infrastructure:

### 1. 🛒 MHD Commerce (Premium E-Store)
A high-performance e-commerce engine focused on conversion and user experience.
*   **Design Philosophy**: Implements **Glassmorphism** with translucent UI layers, 3D glowing accents, and micro-animations for a "luxury" interface.
*   **Advanced Cart**: Persistent cart management with real-time stock validation and optimized parallel processing.
*   **Dynamic Discovery**: 150+ unique, high-resolution products categorized into 12 distinct collections.
*   **Secure Payments**: Integrated **Stripe** flow with parallelized fulfillment logic and automated email confirmations via **Redis/Bull** queues.

### 2. 👨‍💻 MHD Portfolio (Professional Persona)
A sleek, interactive gateway showcasing technical expertise and creative work.
*   **Tech Stack Visualization**: Dynamic rendering of professional skills with brand-specific color-matched iconography.
*   **GitHub Integration**: Live contribution calendar and real-time project statistics.
*   **Interactive Resume**: Downloadable PDF integration and structured multi-page navigation.

---

## 🚀 Technical Excellence

### 💻 Frontend (React 19 + TypeScript)
*   **Modern Build Suite**: Powered by **Vite** for near-instant load times.
*   **Advanced Styling**: Utilizes **Tailwind CSS v4** and React-Bootstrap for a polished, responsive layout.
*   **State Management**: Optimized React Context API for lightweight yet powerful global state handling.

### ⚙️ Backend (Node.js 20 + Express)
*   **Type-Safe Development**: Written entirely in **TypeScript** for robust error catching.
*   **Database**: **MongoDB (Mongoose)** with complex indexing for high-speed searches.
*   **Concurrency**: Uses **Redis** for asynchronous task execution and **Promise.all** parallelization.

### �️ Security & Reliability
*   **Authentication**: JWT-based auth with **HttpOnly cookies** and **Refresh Token Rotation**.
*   **Protection**: Tiered rate limiting, Helmet security headers, and Bcrypt (12-round hashing).
*   **Validation**: Strict input sanitization and schema validation using **Zod**.

---

## 📂 📥 Quick Launch

To launch both applications simultaneously, use the provided batch script in the root directory:

1. Clone the repository.
2. Run `run-unified.bat`.

---

<p align="center">
  Created with ❤️ by <b>Mohamed Aathil R</b>
</p>
