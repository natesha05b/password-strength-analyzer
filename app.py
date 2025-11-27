from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

# Load dictionary passwords (make sure dictionary.txt exists)
try:
    with open("dictionary.txt", "r", encoding="utf-8", errors="ignore") as f:
        common_passwords = set(p.strip().lower() for p in f if p.strip())
except FileNotFoundError:
    common_passwords = set()

def calculate_entropy(password):
    charset = 0
    if any(c.islower() for c in password): charset += 26
    if any(c.isupper() for c in password): charset += 26
    if any(c.isdigit() for c in password): charset += 10
    if any(c in "!@#$%^&*()-_=+[{]}|;:'\",<.>/?`~" for c in password): charset += 32

    if charset == 0 or len(password) == 0:
        return 0.0

    entropy = len(password) * math.log2(charset)
    return round(entropy, 2)

def entropy_to_score(entropy, length, is_common):
    # Base mapping: 0-60+ bits -> 0-100
    score = int(min(100, (entropy / 60.0) * 100))
    # small boosts for length
    if length >= 12:
        score = min(100, score + 10)
    elif length >= 8:
        score = min(100, score + 5)

    # Penalize very common passwords
    if is_common:
        score = min(100, max(1, 5))  # set a very low score for common
    return score

def score_to_text(score, is_common):
    if is_common:
        return "Very Weak"
    if score < 25:
        return "Very Weak"
    elif score < 45:
        return "Weak"
    elif score < 65:
        return "Fair"
    elif score < 85:
        return "Strong"
    else:
        return "Very Strong"

def suggestions_from(password, entropy, score, is_common):
    suggestions = []
    if is_common:
        suggestions.append("Avoid common passwords (e.g., 'password', '123456').")
    if len(password) < 12:
        suggestions.append("Use at least 12 characters; longer passwords are stronger.")
    if not any(c.isupper() for c in password):
        suggestions.append("Add uppercase letters (A–Z).")
    if not any(c.islower() for c in password):
        suggestions.append("Add lowercase letters (a–z).")
    if not any(c.isdigit() for c in password):
        suggestions.append("Include digits (0–9).")
    if not any(c in "!@#$%^&*()-_=+[{]}|;:'\",<.>/?`~" for c in password):
        suggestions.append("Include special characters (e.g., !@#$%).")
    # Encourage passphrases
    if len(password) >= 20:
        suggestions.append("Great — consider a memorable passphrase of 20+ chars.")
    return suggestions

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/check", methods=["POST"])
def check_password():
    password = request.form.get("password", "")
    entropy = calculate_entropy(password)
    is_common = password.lower() in common_passwords if password else False
    score = entropy_to_score(entropy, len(password), is_common)
    rating = score_to_text(score, is_common)
    suggestions = suggestions_from(password, entropy, score, is_common)

    return jsonify({
        "entropy": entropy,
        "score": score,
        "rating": rating,
        "common": is_common,
        "length": len(password),
        "suggestions": suggestions
    })

if __name__ == "__main__":
    app.run(debug=True)
