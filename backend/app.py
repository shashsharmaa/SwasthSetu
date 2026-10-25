import os
import json
from math import asin, cos, radians, sin, sqrt
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
    "- Keep your answers SHORT and CRISP. Maximum 3-4 sentences, unless the user "
    "explicitly asks for detailed explanation, steps, or comparison.\n"
    "- If the user asks a simple question, give a one-line direct answer first, then "
    "1-2 supporting points. Do NOT write long paragraphs.\n"
    "- Use bullet points ONLY if listing 3+ items.\n"
    "- End with a short follow-up question ONLY if relevant (for example, 'Do you "
    "want the list?'); do not always add follow-ups.\n"
    "- CRITICAL: Do NOT ask the user for their age, family members, or personal details. "
    "Focus ONLY on answering the user's current question about hospitals, insurance, or "
    "PM-JAY. Never append a follow-up question asking for personal details unless the "
    "user specifically asks for personalized medical advice.\n"
    "- DO NOT use asterisks (*) or double asterisks (**) for bold or italic text. Use "
    "plain text.\n"
    "- For lists, use simple hyphens (-) instead of bullet points or asterisks.\n"
    "- NEVER provide medical advice, diagnosis, or prescriptions. If asked, politely "
    "decline.\n"
    "- NEVER guarantee claim approvals.\n"
    "- You have access to REAL hospital data when the user asks about hospitals. "
    "NEVER invent hospital names. If the user's context includes REAL HOSPITALS FROM "
    "OUR DATABASE, use only those names. If no real data is provided and the user asks "
    "for hospital lists, say: 'Please use the search bar on the dashboard for accurate "
    "results from our verified database.'\n"
    "- If the user asks for Hinglish or Hindi, reply in natural Hinglish."
    "\n"
    "- Always return your response in TWO formats as a valid JSON object: "
    "{\"reply\": \"the normal Hinglish text in Roman script for the UI\", "
    "\"reply_tts\": \"the exact same meaning written in Devanagari Hindi script "
    "for the Text-to-Speech engine\"}. For example, if reply is "
    "'Aapke liye Virar mein 3 hospitals mile hain', reply_tts must be "
    "'आपके लिए विरार में 3 अस्पताल मिले हैं'. Do not add markdown fences or any "
    "text outside this JSON object."
)


def haversine_distance_km(latitude_one, longitude_one, latitude_two, longitude_two):
    earth_radius_km = 6371.0
    latitude_delta = radians(latitude_two - latitude_one)
    longitude_delta = radians(longitude_two - longitude_one)
    first = (
        sin(latitude_delta / 2) ** 2
        + cos(radians(latitude_one))
        * cos(radians(latitude_two))
        * sin(longitude_delta / 2) ** 2
    )
    return earth_radius_km * 2 * asin(sqrt(first))


HOSPITAL_QUERY_KEYWORDS = (
    "hospital",
    "hospitals",
    "nearby",
    "near me",
    "list",
    "dikhao",
    "batao",
    "search",
)
HOSPITAL_LOCATIONS = (
    ("Nalasopara", ("nalasopara",)),
    ("Bhayandar", ("bhayandar",)),
    ("Palghar", ("palghar",)),
    ("Virar", ("virar",)),
    ("Mira", ("mira", "mira road")),
    ("Vasai", ("vasai",)),
    ("Naigaon", ("naigaon",)),
    ("Mumbai", ("mumbai",)),
)


def get_hospital_request_details(message):
    normalized_message = message.casefold()
    has_keyword = any(keyword in normalized_message for keyword in HOSPITAL_QUERY_KEYWORDS)
    location = next(
        (canonical for canonical, aliases in HOSPITAL_LOCATIONS
         if any(alias in normalized_message for alias in aliases)),
        "",
    )
    insurer = ""
    if "star health" in normalized_message:
        insurer = "Star Health"
    elif "hdfc" in normalized_message:
        insurer = "HDFC ERGO"
    elif "tata aig" in normalized_message or (
        "tata" in normalized_message and "aig" in normalized_message
    ):
        insurer = "TATA AIG"

    scheme = "PM-JAY" if "pmjay" in normalized_message or "pm-jay" in normalized_message else ""
    return has_keyword or bool(location or insurer or scheme), location, insurer, scheme


def retrieve_hospital_context(message):
    is_hospital_query, location, insurer, scheme = get_hospital_request_details(message)
    if not is_hospital_query:
        return False, ""
    if not location and not insurer and not scheme:
        return True, (
            "NO REAL HOSPITALS FOUND. Say exactly: "
            "Maaf kijiye, is location aur insurance ke liye humare database mein koi "
            "hospital nahi mila. Aap dashboard par manually search kar sakte hain."
        )

    query = supabase.table("hospitals").select(
        "name, address, city, accepted_insurers, is_pmjay_empanelled, specialities, phone"
    )
    if location:
        query = query.or_(
            f"city.ilike.%{location}%,"
            f"district.ilike.%{location}%,"
            f"address.ilike.%{location}%"
        )
    if insurer:
        query = query.contains("accepted_insurers", [insurer])
    if scheme:
        query = query.eq("is_pmjay_empanelled", True)

    hospitals = query.limit(10).execute().data or []
    if not hospitals:
        return True, (
            "NO REAL HOSPITALS FOUND. Say exactly: "
            "Maaf kijiye, is location aur insurance ke liye humare database mein koi "
            "hospital nahi mila. Aap dashboard par manually search kar sakte hain."
        )

    lines = ["REAL HOSPITALS FROM OUR DATABASE:"]
    for index, hospital in enumerate(hospitals, start=1):
        insurers = ", ".join(hospital.get("accepted_insurers") or []) or "Not listed"
        address = hospital.get("address") or "Address not listed"
        city = hospital.get("city") or ""
        full_address = f"{address}, {city}".strip(", ")
        pmjay_status = "Yes" if hospital.get("is_pmjay_empanelled") else "No"
        lines.append(
            f"{index}. {hospital.get('name') or 'Unnamed hospital'} - "
            f"{full_address} - Accepts: {insurers} - PMJAY: {pmjay_status}"
        )
    return True, "\n".join(lines)


@app.get("/api/hospitals/search")
def search_hospitals():
    try:
        location = request.args.get("location", "").strip()
        insurer = request.args.get("insurer", "").strip()
        scheme = request.args.get("scheme", "").strip()
        user_latitude = request.args.get("user_lat", "").strip()
        user_longitude = request.args.get("user_lng", "").strip()
        max_distance = request.args.get("max_distance", "").strip()

        coordinates = None
        if user_latitude or user_longitude:
            try:
                coordinates = (float(user_latitude), float(user_longitude))
            except (TypeError, ValueError):
                return jsonify({"error": "user_lat and user_lng must be valid numbers"}), 400
            if not (-90 <= coordinates[0] <= 90 and -180 <= coordinates[1] <= 180):
                return jsonify({"error": "user_lat or user_lng is outside the valid range"}), 400

        distance_limit = None
        if max_distance:
            try:
                distance_limit = float(max_distance)
            except (TypeError, ValueError):
                return jsonify({"error": "max_distance must be a valid number"}), 400
            if distance_limit < 0:
                return jsonify({"error": "max_distance cannot be negative"}), 400
            if coordinates is None:
                return jsonify({"error": "user_lat and user_lng are required for distance filtering"}), 400

        query = supabase.table("hospitals").select("*")
        if location:
            query = query.or_(
                f"name.ilike.%{location}%,"
                f"address.ilike.%{location}%,"
                f"city.ilike.%{location}%,"
                f"district.ilike.%{location}%,"
                f"pincode.ilike.%{location}%"
            )
        if insurer:
            query = query.contains("accepted_insurers", [insurer])
        if scheme:
            query = query.eq("is_pmjay_empanelled", True)

        response = query.execute()
        hospitals = []
        for hospital in response.data:
            if coordinates is not None:
                try:
                    hospital_latitude = float(hospital.get("lat"))
                    hospital_longitude = float(hospital.get("lng"))
                except (TypeError, ValueError):
                    if distance_limit is not None:
                        continue
                else:
                    distance = haversine_distance_km(
                        coordinates[0],
                        coordinates[1],
                        hospital_latitude,
                        hospital_longitude,
                    )
                    hospital["distance_km"] = round(distance, 1)
                    if distance_limit is not None and distance > distance_limit:
                        continue
            hospitals.append(hospital)
        return jsonify(hospitals), 200
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


@app.get("/api/hospitals/nearest")
def nearest_hospitals():
    try:
        latitude = request.args.get("lat", "").strip()
        longitude = request.args.get("lng", "").strip()
        insurer = request.args.get("insurer", "").strip()
        scheme = request.args.get("scheme", "").strip()
        try:
            coordinates = (float(latitude), float(longitude))
        except (TypeError, ValueError):
            return jsonify({"error": "lat and lng must be valid numbers"}), 400
        if not (-90 <= coordinates[0] <= 90 and -180 <= coordinates[1] <= 180):
            return jsonify({"error": "lat or lng is outside the valid range"}), 400

        query = supabase.table("hospitals").select("*")
        if insurer:
            query = query.contains("accepted_insurers", [insurer])
        if scheme:
            query = query.eq("is_pmjay_empanelled", True)

        hospitals = []
        for hospital in query.execute().data:
            try:
                hospital_latitude = float(hospital.get("lat"))
                hospital_longitude = float(hospital.get("lng"))
            except (TypeError, ValueError):
                continue
            hospital["distance_km"] = round(
                haversine_distance_km(
                    coordinates[0],
                    coordinates[1],
                    hospital_latitude,
                    hospital_longitude,
                ),
                1,
            )
            hospitals.append(hospital)
        hospitals.sort(key=lambda hospital: hospital["distance_km"])
        return jsonify(hospitals[:3]), 200
    except Exception as error:
        app.logger.exception("Nearest hospital lookup failed")
        return jsonify({"error": str(error)}), 500


@app.post("/api/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    messages = payload.get("messages")
    user_context = payload.get("userContext") or {}
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
    if not isinstance(user_context, dict):
        return jsonify({"error": "userContext must be an object"}), 400
    user_message = next(
        (item["content"].strip() for item in reversed(messages) if item["role"] == "user"),
        messages[-1]["content"].strip(),
    )
    print(f"Received message: {user_message}")

    try:
        is_hospital_query, hospital_context = retrieve_hospital_context(user_message)
        system_message = {"role": "system", "content": KIWI_SYSTEM_PROMPT}
        context_message = {
            "role": "system",
            "content": (
                "User Info: "
                f"{user_context}. Use this information to tailor your answers when relevant. "
                "Do not request additional personal details. Answer the current user "
                "question directly and concisely."
            ),
        }
        final_messages = [
            system_message,
            context_message,
            *[
                {"role": item["role"], "content": item["content"].strip()}
                for item in messages
            ],
        ]
        if is_hospital_query:
            retrieval_message = {
                "role": "system",
                "content": (
                    "Answer the user's hospital question using ONLY the database context "
                    "below. Never invent or substitute hospital names. Format available "
                    "hospitals as a numbered list with name, address, and accepted "
                    "insurances. Keep it to a maximum of 5 hospitals.\n\n"
                    f"{hospital_context}"
                ),
            }
            final_messages.insert(0, retrieval_message)
        chat_completion = groq_client.chat.completions.create(
            messages=final_messages,
            model="openai/gpt-oss-120b",
        )
        raw_response = (chat_completion.choices[0].message.content or "").strip()
        try:
            parsed_response = json.loads(raw_response)
        except json.JSONDecodeError:
            parsed_response = {}

        if isinstance(parsed_response, dict) and isinstance(parsed_response.get("reply"), str):
            reply_text = parsed_response["reply"].replace("*", "").strip()
            reply_tts_text = parsed_response.get("reply_tts", "")
            if not isinstance(reply_tts_text, str):
                reply_tts_text = ""
        else:
            reply_text = raw_response.replace("*", "").strip()
            reply_tts_text = ""

        if not reply_text:
            raise RuntimeError("Groq returned an empty reply.")
        return jsonify({"reply": reply_text, "reply_tts": reply_tts_text}), 200
    except Exception as error:
        print("GROQ ERROR:", str(error))
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
