# MERN Blog Project (Client) 

This is the frontend client for the MERN Blog application, built using React and Vite. It provides the user interface for reading and interacting with blog posts.

## 🚀 Project Overview

This application is a simple blog platform where users can view posts. This client-side application handles the presentation layer, fetching data from and potentially sending data to a backend API (built separately as part of the MERN stack).

## 💻 Tech Stack

This project utilizes the following technologies:

* **Frontend Library:** React 19
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Linting:** ESLint
* **Package Manager:** npm (implied from `package-lock.json`)

*(Note: The backend stack typically includes Node.js, Express, and MongoDB, but those are not part of this specific client repository.)*

## ✨ Features

* Minimal setup using Vite for fast development.
* React 19 for building the user interface.
* Tailwind CSS for utility-first styling.
* ESLint configured for code quality.

## ⚙️ Getting Started

### Prerequisites

* Node.js (LTS version recommended)
* npm

### Installation & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## 🛠️ Available Scripts

In the project directory, you can run:

* `npm run dev`: Runs the app in development mode with hot reloading.
* `npm run build`: Builds the app for production to the `dist` folder.
* `npm run lint`: Lints the project files using ESLint.
* `npm run preview`: Serves the production build locally for preview.