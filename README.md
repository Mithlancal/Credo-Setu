# 🏦 Credo Setu (क्रेडो सेतु)

<div align="center">

![Credo Setu Banner](https://via.placeholder.com/1200x300/0a192f/ffffff?text=Credo+Setu+-+Building+a+Digital+Identity+for+India's+Informal+Economy)

**A mobile‑first decentralized ledger that creates verifiable credit history for micro‑merchants using peer validation, AI scoring, and India Stack integration.**

[![HackIndia Spark 6](https://img.shields.io/badge/HackIndia-Spark%206%20%40%20NIT%20Delhi-blue?style=for-the-badge)](https://hackindia.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)

</div>

---

## 📖 Table of Contents
- [The Invisible Economy](#-the-invisible-economy)
- [Our Solution: Credo Setu](#-our-solution-credo-setu)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Value Proposition](#-value-proposition)
- [Impact & Feasibility](#-impact--feasibility)
- [Live Demo & Screenshots](#-live-demo--screenshots)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Team](#-team)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🕵️ The Invisible Economy

| Metric | Reality |
|--------|---------|
| **Workforce Excluded** | **80%** of India's workforce cannot access formal credit |
| **Micro‑Merchants** | **60 Million+** street vendors, kirana shops, artisans |
| **Cash Dependency** | **100%** cash economy → zero digital footprint |
| **GDP Contribution** | **50%+** of India's GDP comes from the informal sector |
| **Predatory Lending** | When emergency strikes → **साहूकार** (moneylender) charges **5‑10% per month** (60‑120% APR) |

> **Result:** Generational poverty despite relentless hard work.  
> **Root Cause:** Banks cannot lend without data → No data = No loan.

---

## 🚀 Our Solution: Credo Setu

**Credo Setu** (क्रेडो सेतु – “Credit Bridge”) transforms how India's informal economy builds financial trust.  
We provide a **mobile‑first, decentralized ledger** that enables micro‑merchants to:

- Record daily transactions effortlessly
- Validate each other's business activity through peer endorsements
- Generate a **tamper‑proof, AI‑powered credit score**
- Connect directly with **NBFCs and formal lenders** via India Stack

By bridging the gap between cash‑based micro‑businesses and formal financial institutions, Credo Setu turns **trust into a digital asset**.

---

## ✨ Key Features

### 1️⃣ Decentralised Transaction Ledger
- Each transaction is hashed and linked using a simplified **Merkle tree** (SHA‑256).
- No central authority can alter the record – **community‑verified integrity**.

### 2️⃣ Peer Validation Network
- Fellow merchants confirm transactions with a single tap.
- Simulated via **Firebase real‑time updates** in the prototype; ready for full P2P implementation.

### 3️⃣ AI‑Driven Credit Scoring
- Dynamic score based on **transaction frequency**, **repayment timeliness**, and **peer approvals**.
- Prototype uses hard‑coded logic; production version integrates **India Stack APIs** (Aadhaar eKYC, Account Aggregator, UPI).

### 4️⃣ QR‑Based Merchant Identification
- Simple random ID generation for demo (simulated scanning).
- Enables seamless merchant onboarding and transaction tagging.

### 5️⃣ NBFC Dashboard Integration
- Static dashboard view demonstrates how financial institutions would access verified credit histories.
- Built to integrate with **AA (Account Aggregator)** framework.

### 6️⃣ Dual‑Sided Credit Building
- **Merchants** build credit through their business transactions.
- **Customers** can optionally build their own credit history by repaying merchant‑issued credit on time.

---

## ⚙️ How It Works

```mermaid
graph TD
    A[Merchant records transaction] --> B[Transaction hashed & stored in Firebase]
    B --> C[Peer validation requested]
    C --> D[Peers approve via mobile app]
    D --> E[Credit score updates based on pre‑computed logic]
    E --> F[NBFC dashboard displays verified credit profile]
    F --> G[Formal loan approval enabled]
