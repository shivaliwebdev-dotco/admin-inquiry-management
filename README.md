
# InquiryFlow — Admin Panel to Manage Inquiries

A responsive customer inquiry management dashboard built using HTML, CSS,
JavaScript, Node.js and Express.

## Features

- Dashboard statistics
- View customer inquiries
- Search by name, email or subject
- Filter by inquiry status
- Add new inquiries
- View inquiry details
- Update inquiry status
- Delete inquiries
- Export inquiry data to CSV
- Dark glassmorphism user interface
- Responsive layout

## Technologies Used

Frontend:
- HTML5
- CSS3
- JavaScript

Backend:
- Node.js
- Express.js
- CORS

Storage:
- Temporary in-memory JavaScript array
- No database required

## Installation

1. Install Node.js on your computer.

2. Open the project folder in VS Code.

3. Open the terminal and navigate to the backend folder:

   cd backend

4. Install the dependencies:

   npm install

5. Start the server:

   npm start

6. Open your browser and visit:

   http://localhost:5000/api

   You should see a message confirming that the API is running.

7. Open frontend/index.html in your browser.
   You can use the VS Code Live Server extension for this step.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api | Check the API |
| GET | /api/inquiries | Fetch all inquiries |
| GET | /api/inquiries/:id | Fetch one inquiry |
| POST | /api/inquiries | Create an inquiry |
| PATCH | /api/inquiries/:id | Update inquiry status |
| DELETE | /api/inquiries/:id | Delete an inquiry |

## Important Note

This project does not use a database. Inquiry data is stored in memory
while the Express server is running.

New inquiries and changes will be lost when the server restarts.
