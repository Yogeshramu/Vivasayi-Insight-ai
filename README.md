<<<<<<< HEAD
# Vivasayi-Insight-ai
=======
# AgriPulse-AI 🌾🤖

AgriPulse-AI is a comprehensive, intelligent agricultural decision-support platform designed to empower farmers with real-time insights, disease diagnosis, and predictive analytics. Built with a focus on accessibility, it supports both **English** and **Tamil** languages.

## 🚀 Key Features

### 1. **Intelligent Farm Assistant (AI Chat)**
- Multimodal AI chatbot powered by **Groq (Meta Llama 3)**.
- Upload photos of your farm or text your queries.
- Get instant expert advice on pest control, fertilizers, and crop management.

### 2. **Vision-Based Crop Analysis**
- Upload leaf or plant images to diagnose diseases instantly.
- Uses **Llama-4-Scout** for high-accuracy plant pathology detection.
- Provides specific treatment steps and severity assessments.
- Detects non-agricultural images to ensure data integrity.

### 3. **Smart Soil Moisture Prediction**
- Predict soil moisture levels without expensive physical sensors.
- Uses environmental data (Temp, Humidity, Rainfall) and AI to estimate irrigation needs.
- Personalized recommendations based on the specific crop variety (Rice, Tomato, Coconut, etc.).

### 4. **Weather-Driven Farming Tips**
- Real-time weather integration with localized farming advisories.
- High-priority alerts for temperature spikes, heavy winds, or frost risks.

### 5. **User Accounts & Data Privacy**
- Secure account management with **NextAuth.js**.
- Private history for all your soil predictions and crop analyses.
- Date-based dynamic verification for secure registration.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS / Vanilla CSS
- **Backend**: Next.js API Routes (App Router)
- **Database**: PostgreSQL with **Prisma ORM**
- **AI/ML**: Groq Cloud SDK (Llama 3.1 & Vision Models)
- **Authentication**: NextAuth.js (Credentials Provider)
- **Maps/Weather**: OpenWeatherMap API

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (Latest LTS)
- PostgreSQL Database
- Groq API Key
- OpenWeatherMap API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd c2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/db"
   NEXTAUTH_SECRET="your-secret-here"
   GROQ_API_KEY="your-groq-api-key"
   OPENWEATHER_API_KEY="your-weather-api-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize Database**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📸 Screenshots

*(Add your screenshots here)*

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.
>>>>>>> 14a0d9f (Initial commit: AgriPulse-AI platform with Chat, Soil Prediction, and Crop Analysis)
