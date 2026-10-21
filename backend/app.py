import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from groq import Groq
from supabase import create_client


backend_dir = Path(__file__).resolve().parent
env_file = backend_dir / ".env"
if not env_file.exists():
    env_file = backend_dir / "venv" / ".env"
load_dotenv(env_file)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in the backend .env file.")

supabase = create_client(supabase_url, supabase_key)
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

KIWI_SYSTEM_PROMPT = (
    "You are Kiwi, a highly intelligent and helpful AI assistant for the SwasthSetu "
    "healthcare app.\n"
    "ABOUT SWASTHSETU APP: You are part of the SwasthSetu platform. SwasthSetu helps "
    "users find hospitals based on their health insurance (like Star Health, HDFC ERGO, "
    "TATA AIG) or government schemes (like PM-JAY) and their location. Users can search "
    "by location, view hospitals on a map, and see details like accepted insurances and "
    "'Before You Visit' checklists. If a user asks how to use the app, guide them to "
    "use the Private Insurance or Government Scheme buttons on the home page, enter "
    "their location, and click Search.\n"
    "- Your goal is to provide comprehensive, well-structured, and easy-to-understand "
    "answers, similar to ChatGPT.\n"
    "- DO NOT use asterisks (*) or double asterisks (**) for bold or italic text. Use "
    "plain text.\n"
    "- For lists, use simple hyphens (-) instead of bullet points or asterisks.\n"
    "- NEVER provide medical advice, diagnosis, or prescriptions. If asked, politely "
    "decline.\n"
    "- NEVER guarantee claim approvals.\n"
    "- If the user asks for Hinglish or Hindi, reply in natural Hinglish."
)


@app.get("/api/hospitals/search")
def search_hospitals():
    try:
        location = request.args.get("location", "").strip()
        insurer = request.args.get("insurer", "").strip()
        scheme = request.args.get("scheme", "").strip()

        query = supabase.table("hospitals").select("*")
        if location:
            query = query.ilike("city", f"%{location}%")
        if insurer:
            query = query.contains("accepted_insurers", [insurer])
        if scheme:
            query = query.eq("is_pmjay_empanelled", True)

        response = query.execute()
        return jsonify(response.data), 200
    except Exception as error:
        app.logger.exception("Hospital search failed")
        return jsonify({"error": str(error)}), 500


@app.get("/api/hospitals/<hospital_id>")
def get_hospital(hospital_id):
    try:
        response = (
            supabase.table("hospitals")
            .select("*")
            .eq("id", hospital_id)
            .execute()
        )
        if not response.data:
            return jsonify({"error": "Hospital not found"}), 404
        return jsonify(response.data[0]), 200
    except Exception as error:
        app.logger.exception("Hospital lookup failed")
        return jsonify({"error": str(error)}), 500


@app.post("/api/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    messages = payload.get("messages")
    if not isinstance(messages, list) or not messages:
        return jsonify({"error": "messages must be a non-empty array"}), 400
    if any(
        not isinstance(item, dict)
        or item.get("role") not in {"user", "assistant"}
        or not isinstance(item.get("content"), str)
        or not item["content"].strip()
        for item in messages
    ):
        return jsonify({"error": "messages must contain valid user or assistant entries"}), 400
    print(f"Received message: {messages[-1]['content']}")

    try:
        system_message = {"role": "system", "content": KIWI_SYSTEM_PROMPT}
        final_messages = [
            system_message,
            *[
                {"role": item["role"], "content": item["content"].strip()}
                for item in messages
            ],
        ]
        chat_completion = groq_client.chat.completions.create(
            messages=final_messages,
            model="openai/gpt-oss-120b",
        )
        response_text = (chat_completion.choices[0].message.content or "").replace("*", "")
        return jsonify({"reply": response_text}), 200
    except Exception as error:
        print("GROQ ERROR:", str(error))
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
