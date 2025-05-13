from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)

# Load trained model and vectorizer
model = joblib.load('rf_bully_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

# Global toggle flag
cyber_safe_mode_active = False

@app.route("/activate", methods=["POST"])
def activate():
    global cyber_safe_mode_active
    data = request.json
    if data.get("activate"):
        cyber_safe_mode_active = True
        return jsonify({"status": "Cyber Safe Mode activated"}), 200
    else:
        return jsonify({"status": "Ignored. To deactivate, use /deactivate."}), 400

@app.route("/predict", methods=["POST"])
def predict():
    if not cyber_safe_mode_active:
        return jsonify({"error": "Cyber Safe Mode is not active"}), 403

    data = request.json
    message = data.get("message", "")
    if not message:
        return jsonify({"error": "No message provided"}), 400

    features = vectorizer.transform([message])
    prediction = model.predict(features)[0]

    label_map = {
        0: "non-bully",
        1: "bully",
        2: "neutral"
    }
    predicted_label = label_map.get(int(prediction), "unknown")
    return jsonify({"label": predicted_label})


if __name__ == "__main__":
    app.run(debug=True)
