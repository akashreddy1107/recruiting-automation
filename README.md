# Recruiting Automation System

A comprehensive recruiting automation tool that filters emails, scores candidates, and exports data to Google Sheets and Drive.

## Project Location
This project is saved locally at:
`C:\Users\akash\.gemini\antigravity\scratch`

## Prerequisites
-   Node.js installed
-   Google Cloud Project with Gmail, Sheets, and Drive APIs enabled
-   `backend/.env` file configured with your Google Credentials

## How to Run Manually

You need to run the **Backend** and **Frontend** in two separate terminals.

### 1. Start the Backend
The backend handles email processing, authentication, and database operations.

1.  Open a terminal (Command Prompt or PowerShell).
2.  Navigate to the backend folder:
    ```bash
    cd C:\Users\akash\.gemini\antigravity\scratch\backend
    ```
3.  Start the server:
    ```bash
    npm start
    ```
    *You should see: "Server running on port 5000"*

### 2. Start the Frontend
The frontend is the user interface (Dashboard).

1.  Open a **new** terminal window.
2.  Navigate to the frontend folder:
    ```bash
    cd C:\Users\akash\.gemini\antigravity\scratch\frontend
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and go to the URL shown (usually `http://localhost:5173`).

## Features
-   **Google Login**: Secure authentication with your Gmail account.
-   **Automation**: Scans emails for "Application", "Resume", etc.
-   **Smart Filtering**: Ignores spam and newsletters.
-   **Scoring**: Rates candidates based on Skills, Experience, and Visa status.
-   **Exports**:
    -   **Google Sheets**: Creates a sheet with candidate details.
    -   **Google Drive**: Uploads PDF resumes and links them in the sheet.
