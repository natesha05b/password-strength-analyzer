🔐 Overview

Password Strength Analyzer is a web-based cybersecurity tool designed to evaluate the security level of a password.
It measures password strength using:

Entropy calculation

Character complexity

Length analysis

Dictionary attack detection

Real-time interactive strength meter

The project uses Flask (Python) for the backend, HTML/CSS/JS for the frontend, and is fully deployed online using Render.

🚀 Live Demo

🔗 Live Website: https://password-strength-analyzer-1jix.onrender.com

🧠 Features

✔ Real-time password strength meter (circular meter)

✔ Checks for:

Uppercase letters

Lowercase letters

Numbers

Special characters

Length quality

✔ Entropy calculation (logarithmic randomness score)

✔ Dictionary attack detection using dictionary.txt

✔ Suggestion generator for weak passwords

✔ Clean, modern, interactive UI

✔ Flask API backend (/api/check)

✔ Fully deployed online using Render

✔ Auto-redeploy on GitHub push

📂 Project Structure
Password Strength Analyzer/
│── app.py
│── Procfile
│── requirements.txt
│── dictionary.txt
│
├── templates/
│   └── index.html
│
└── static/
    ├── style.css
    └── script.js

⚙️ Tech Stack
Frontend

HTML5

CSS3

JavaScript (fetch API)

Backend

Python

Flask

Gunicorn (production server for Render)

Deployment

Render Web Service

GitHub (auto-deploy pipeline)

🛠️ How It Works
1. User enters a password

The frontend sends the password to:

POST /api/check

2. Backend performs:

Character set analysis

Entropy calculation

Common-password lookup

Score & rating assignment

Suggestion generation

3. Backend returns JSON:
{
  "entropy": 45.23,
  "score": 72,
  "rating": "Strong",
  "common": false,
  "length": 10,
  "suggestions": []
}

4. Frontend updates:

Circular strength meter

Rating label

Entropy bits

Suggestions

📦 Installation (Local Running)
Step 1 — Install dependencies
pip install -r requirements.txt

Step 2 — Run the Flask server
python app.py

Step 3 — Open browser
http://127.0.0.1:5000

🌐 Deploying to Render
Required files:

✔ Procfile
✔ requirements.txt
✔ GitHub repository

Steps:

Push project to GitHub

Go to Render → “New Web Service”

Connect GitHub repo

Set:

Build Command:

pip install -r requirements.txt


Start Command:

gunicorn app:app


Deploy ✔

📝 Updating Common Password List

To update dictionary.txt:

Edit the file locally

Save

Run:

git add dictionary.txt
git commit -m "Update dictionary"
git push


Render will automatically rebuild and update your live website.

🛡️ Why This Project Is Useful

Demonstrates cybersecurity concepts

Shows understanding of entropy & brute-force resistance

Includes real-world dictionary-attack detection

Proves full-stack + deployment skills

Great for resumes, interviews, and academic projects

📄 License

This project is for educational and personal use.

🙋‍♂️ Author

Made by: Bangla Natesha
Assistant support: ChatGPT,Other A.I Tools
