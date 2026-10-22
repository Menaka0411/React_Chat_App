# 💬 Chat App with Cyberbullying Detection

A real-time chat application built with React and Socket.IO, integrated with a machine learning-based cyberbullying detection system. The application includes **Cyber Safe Mode**, which detects potentially harmful messages and blocks them from being sent while allowing normal messages to pass through.

---

## Features

- 🔒 User authentication (register/login/logout)
- 💬 Real-time messaging using Socket.IO
- 🗂️ One-on-one private conversations
- 🛡️ Cyber Safe Mode to enable or disable message moderation
- 🤖 Machine learning-based cyberbullying detection
- 🚫 Blocks harmful messages when Cyber Safe Mode is enabled
- ✅ Allows normal messages to be sent
- 🔤 Text preprocessing and TF-IDF vectorization
- 🖼️ Emoji and image sharing support
- 🌙 Light and Dark mode
- 📱 Responsive chat interface

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Socket.IO Client
- Axios
- CSS / Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO

### Machine Learning API
- Python
- Flask
- Flask-CORS
- Scikit-learn
- Joblib
- TF-IDF Vectorizer
- Random Forest Classifier

### Other Tools
- JWT for authentication
- Bcrypt for password hashing
- Dotenv for environment variables

---

## Cyberbullying Detection

The application integrates a machine learning model that classifies chat messages to help identify potentially harmful content.

### How It Works

1. The user types a message in the chat application.
2. When Cyber Safe Mode is enabled, the message is checked before being sent.
3. The message is transformed into numerical features using the trained TF-IDF vectorizer.
4. A Random Forest classifier predicts the message category.
5. If the message is classified as harmful, it is blocked from being sent and a warning is displayed.
6. If the message is classified as non-harmful, it can be sent normally.

### Classification Labels

| Model Output | Classification |
|---|---|
| `0` | `non-bully` |
| `1` | `bully` |
| `2` | `neutral` |

The available classifications depend on the labels supported by the trained model.

---

## Cyber Safe Mode

Cyber Safe Mode provides message moderation within the chat application.

- **Enabled:** Harmful messages are blocked from being sent.
- **Enabled:** Normal messages can still be sent.
- **Disabled:** Messages can be sent without moderation enforced by Cyber Safe Mode.

When a harmful message is blocked, the application displays a warning similar to:

> This message has offensive content and is not sent due to safe mode.

---

## 🔌 Flask API Endpoints

The Flask API provides endpoints to activate Cyber Safe Mode and classify messages.

### 1. Activate Cyber Safe Mode

**Endpoint:** `POST /activate`

Request body:

```json
{
  "activate": true
}
```

Successful response:

```json
{
  "status": "Cyber Safe Mode activated"
}
```

### 2. Predict Message Classification

**Endpoint:** `POST /predict`

Request body:

```json
{
  "message": "You are a shit"
}
```

Example response:

```json
{
  "label": "bully"
}
```

Possible labels include `bully`, `non-bully`, and `neutral`, depending on the trained model.

The `/predict` endpoint returns an error if Cyber Safe Mode is inactive or no message is provided.

---

## Machine Learning Workflow

The machine learning component was developed using Python and Scikit-learn.

1. Load and explore the cyberbullying dataset.
2. Clean and preprocess text data.
3. Convert text into numerical features using TF-IDF vectorization.
4. Split the dataset into training and testing sets.
5. Train a Random Forest classifier.
6. Evaluate the model using accuracy and classification reports.
7. Explore cross-validation and hyperparameter tuning.
8. Save the trained model and vectorizer using Joblib.
9. Load the saved artifacts into the Flask API for message prediction.

---

## App Design

<table>
  <tr>
    <td><img src="./screenshots/img1.png" width="500" alt="Chat application interface"/></td>
    <td><img src="./screenshots/img2.png" width="500" alt="Chat application interface"/></td>
  </tr>
  <tr>
    <td><img src="./screenshots/Img3.png" width="500" alt="Chat application screen 3"/></td>
    <td><img src="./screenshots/img4.png" width="500" alt="Chat application screen 4"/></td>
  </tr>
  <tr>
    <td><img src="./screenshots/img5.png" width="500" alt="Chat application screen 5"/></td>
    <td><img src="./screenshots/img6.png" width="500" alt="Chat application screen 6"/></td>
  </tr>
  <tr>
    <td><img src="./screenshots/img7.png" width="500" alt="Chat application screen 7"/></td>
    <td><img src="./screenshots/img8.png" width="500" alt="Chat application screen 8"/></td>
  </tr>
  <tr>
    <td><img src="./screenshots/img9.png" width="500" alt="Chat application screen 9"/></td>
    <td><img src="./screenshots/img10.png" width="500" alt="Chat application screen 10"/></td>
  </tr>
</table>

### Cyber Safe Mode in Action

When Cyber Safe Mode is enabled, harmful messages are blocked, and a warning is displayed in the chat interface. Normal messages continue to be delivered.

---

## 📂 Machine Learning Files

The Flask API requires the following files:

```text
app.py
rf_bully_model.pkl
tfidf_vectorizer.pkl
```

The trained model and vectorizer must be generated using compatible training code and preprocessing steps.

The Jupyter Notebook (`.ipynb`) contains the machine learning experiments and model training workflow.

---

## ▶️ Installation and Setup

### Prerequisites

- Python
- Node.js and npm
- MongoDB, if used by the chat backend
- Trained model and vectorizer files

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_PROJECT_DIRECTORY
```

### 2. Install Python Dependencies

```bash
pip install flask flask-cors scikit-learn joblib
```

### 3. Configure the Machine Learning Files

Place the following files in the same directory as `app.py`:

```text
rf_bully_model.pkl
tfidf_vectorizer.pkl
```

### 4. Start the Flask API

```bash
python app.py
```

### 5. Start the Chat Application

Install the frontend and backend dependencies using their respective `package.json` files and start the services using the project's configured npm scripts.

Configure the chat application to communicate with the Flask API for message classification when Cyber Safe Mode is enabled.

---

## 🔐 Notes

- Cyber Safe Mode must be activated before the Flask prediction endpoint can classify messages.
- The model and vectorizer must use compatible feature representations and preprocessing.
- The current Flask implementation stores the Cyber Safe Mode flag in memory, so it resets when the Flask process restarts.
- Model predictions may not always be accurate and depend on the quality of the training dataset.
- The Flask development server should be configured appropriately before production deployment.

---

## 🎯 Project Objective

To integrate real-time messaging with machine learning-based cyberbullying detection and automated message moderation, helping create a safer environment for online communication.

---

## 👩‍💻 Project Focus

**Full-Stack Development | Machine Learning | Natural Language Processing | Real-Time Communication | Content Moderation**
