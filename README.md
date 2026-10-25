# SwasthSetu - Bridging You to Care 🏥

SwasthSetu is a centralized healthcare hospital-discovery platform that helps users find hospitals based on their private health insurance (Star Health, HDFC ERGO, TATA AIG) or government schemes (PM-JAY) and their location.

## ✨ Key Features

- **Dual-Pathway Search:** Switch between Private Insurance and Government Schemes instantly without retyping the location.
- **Real-time Map & Location:** Find hospitals near you with distance filtering, interactive Leaflet maps, and routing.
- **Kiwi AI Assistant:** A voice-enabled AI chatbot (Powered by Groq/Llama 3) that answers insurance queries using real database data (RAG).
- **Data Transparency:** Color-coded verification badges, official source links, and a "Report Wrong Info" feature.
- **Emergency SOS:** One-click nearest hospital finder with a call option.
- **Compare & Save:** Compare up to 3 hospitals and save them to your profile for quick access.

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, Leaflet (Maps)
- **Backend:** Python, Flask, Gunicorn
- **Database:** Supabase (PostgreSQL)
- **AI:** Groq API (Llama 3.3 70B) with RAG (Retrieval Augmented Generation) and Web Speech API for voice.

## 🚀 Local Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/shashsharmaa/SwasthSetu.git
cd SwasthSetu
```

### 2. Frontend Setup

```bash
npm install
npm run dev
```

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # For Windows
pip install -r requirements.txt
python app.py
```

Create a `.env` file in the `backend` directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
GROQ_API_KEY=your_groq_api_key
```

## 📊 Database Schema

The project uses a `hospitals` table in Supabase with columns like `name`, `address`, `city`, `lat`, `lng`, `accepted_insurers` (array), and `is_pmjay_empanelled` (boolean).

## 👨‍💻 Author

**Shashank Sharma** | IDEA LAB-V | Computer Engineering
