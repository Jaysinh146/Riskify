AI-Based Threat Detection System for Workspace Messaging

🔗 Live Demo: https://riskify.netlify.app

Riskify–LDP (Language Detection Platform) is a machine learning and NLP-based threat detection system designed to identify malicious or risky messages in workspace communication environments.
The system uses Transformer-based NLP models to analyze messages and report suspicious activity to a cyber administrator for timely action.

This project was developed as a Final Year B.Tech Project.

**Project Objective**

1. To build an automated system that:

2. Detects potentially malicious or harmful messages

3. Uses NLP and Transformer models for intent analysis

4. Flags threats with high accuracy (~90%)

5. Assists cyber administrators in proactive security monitoring

**How Riskify Works**

1. Messages are received by the system

2. Text is cleaned and preprocessed

3. NLP + Transformer models analyze intent

4. Messages are classified as safe or risky

5. Risky messages are reported to the admin

**Key Features**

1. NLP-based malicious message detection

2. Transformer-based intent classification

3. ~90% detection accuracy

**Admin reporting mechanism
**
Scalable and modular architecture

Designed for workspace security use cases

**Technologies Used
**
1. Programming Language: Python

2. Machine Learning: NLP, Transformers

3. Frontend: HTML, CSS, JavaScript

4. Deployment: Netlify

5. Data Processing: Tokenization, embeddings, text preprocessing

**Model Performance
**
1. Accuracy: ~90% on threat detection tasks

2. Handles informal language and intent masking

3. Optimized for workspace-style communication

**Live Demo
**
You can explore the working prototype here:
👉 https://riskify.netlify.app

**📂 Project Structure (Overview)
**alertlight-detect/
│
├── model/              # NLP & ML models
├── preprocessing/      # Text cleaning & tokenization
├── backend/            # Message analysis & classification logic
├── frontend/           # UI components
├── dataset/            # Training & testing data
└── README.md

**Cloning the Repository
**git clone https://github.com/Jaysinh146/alertlight-detect.git
cd alertlight-detect

**Running the Project Locally
**1️⃣ Install Dependencies
pip install -r requirements.txt

2️⃣ Run the Backend
python app.py

3️⃣ Open the Frontend

Open index.html in your browser
OR

Use a local server (recommended)

**🧭 Understanding the Codebase
**
preprocessing/ → Handles text cleaning, tokenization, and normalization

model/ → Contains Transformer and NLP model logic

backend/ → Message flow, prediction, and admin alert handling

frontend/ → User interface and message input/output

Start from the backend entry point (app.py) to understand the data flow end-to-end.

**🤝 Contributing Guidelines
**
Contributions are welcome for:

1. Improving model accuracy

2. Enhancing UI/UX

3. Adding real-time messaging integrations

4. Code optimization and documentation

**Steps to contribute:
**
1. Fork the repository

2. Create a new branch

3. Make your changes

4. Submit a pull request with a clear description

**Project Team
**
This project was developed by:

Sujal

Sannidhya

Harsh

Jaysinh

As part of the Final Year B.Tech curriculum.

⚠️ Disclaimer

Riskify is intended strictly for educational and defensive cybersecurity purposes.
It should be deployed in compliance with organizational policies and applicable laws.
