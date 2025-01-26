

---

# GitHub Battle Application

This repository contains both the **frontend** and **backend** for the **GitHub Battle** application, where two users battle by comparing their GitHub profile statistics. 

- **Frontend**: Built with React.js to provide a dynamic user interface.
- **Backend**: Built with Flask to handle API requests, fetch GitHub profile data, and interact with the Gemini API.

---

## Features

- **Frontend**: 
  - Displays GitHub profile information.
  - Allows users to initiate battles by comparing two GitHub profiles.
  - Responsive design for both desktop and mobile views.

- **Backend**:
  - Fetches GitHub user data and compares statistics for the battle.
  - Uses the Gemini API for additional profile data.
  - Supports RESTful endpoints for communication with the frontend.

---

## Technologies Used

- **Frontend**: React.js, JavaScript (ES6+), CSS, Axios
- **Backend**: Flask (Python), Gemini API for profile data
- **Environment Variables**: `.env` for securely storing API keys

---

## Setup Instructions

### Prerequisites

- Python 3.x
- Node.js & npm

### Steps to Set Up:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/github-battle-app.git
   cd github-battle-app
   ```

2. **Backend Setup**:
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Set up a virtual environment (optional but recommended):
     ```bash
     python3 -m venv venv
     source venv/bin/activate  # On Windows, use venv\Scripts\activate
     ```
   - Install the backend dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Create a `.env` file in the `backend` folder with your Gemini API key:
     ```env
     GEMINI_API_KEY=your-gemini-api-key-here
     ```
   - Run the Flask backend:
     ```bash
     flask run
     ```
   The backend will be available at [http://localhost:5000](http://localhost:5000).

3. **Frontend Setup**:
   - Navigate to the `frontend` directory:
     ```bash
     cd frontend
     ```
   - Install the frontend dependencies:
     ```bash
     npm install
     ```
   - Start the React development server:
     ```bash
     npm start
     ```
   The frontend will be available at [http://localhost:3000](http://localhost:3000).

4. The application is now running with both frontend and backend locally.

---

## Endpoints (Backend)

- `GET /battle`: Initiates a battle between two GitHub profiles. Example usage:
  ```
  /battle?user1=<github_username1>&user2=<github_username2>
  ```

- `GET /user`: Fetches data for a specific GitHub user. Example usage:
  ```
  /user?username=<github_username>
  ```

---

## License

MIT License

---

