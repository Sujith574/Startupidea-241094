# ParcelBridge — Render & PostgreSQL Setup Guide

Follow these steps to get your platform live using **Render's Native PostgreSQL** for the database and **Render** for hosting. No external setup is required!

---

## ☁️ Part 1: Render Deployment (Full-Stack)

The repository already contains a `render.yaml` file, which makes setup automatic.

1.  **Connect GitHub**: Go to [dashboard.render.com](https://dashboard.render.com), sign in with GitHub, and give Render access to your `Startupidea-241094` repository.
2.  **Create Blueprint**:
    *   Click **"New"** (top right) → **"Blueprint"**.
    *   Select your repository `Sujith574/Startupidea-241094`.
    *   Render will read the `render.yaml` file and show three services: 
        *   `parcelbridge-db` (PostgreSQL)
        *   `parcelbridge-backend` (Node.js API)
        *   `parcelbridge-frontend` (Static Site)
3.  **Approve**: Click **"Approve"**.
    *   Render will automatically create the database, link it to the backend, and start the build.
4.  **Final Step (Frontend URL)**:
    *   Wait for the **Backend** to finish deploying. Copy its URL (e.g., `https://parcelbridge-backend.onrender.com`).
    *   Go to the **Frontend service** settings in Render.
    *   Under **Environment**, add:
        *   `VITE_API_BASE_URL`: (Paste your Backend URL).
    *   Wait for the Frontend to rebuild and deploy.

---

## 🛠️ Part 2: Local Testing

To run the project on your own computer, you will need to install PostgreSQL locally:

1.  **Open Terminal** in the `STARTUPIDEA` folder.
2.  **Backend**:
    ```bash
    cd backend
    npm install
    # Update your .env with your local PostgreSQL URL
    npm run dev
    ```
3.  **Frontend**:
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

---

## ✅ Post-Deployment Checklist

*   **Email Auth**: Try logging in with your email. You should receive a beautiful OTP email from `sujithlavudu@gmail.com`.
*   **Database**: You can view your tables and data directly in the Render dashboard under the `parcelbridge-db` service.
*   **Admin Access**:
    *   Register your first user.
    *   In the Render dashboard, go to your **PostgreSQL** service → **PSQL Shell**.
    *   Run the command: `UPDATE "Users" SET role = 'admin' WHERE email = 'your_email@gmail.com';`
    *   Refresh the website to see the Admin Dashboard.

---

📦 **ParcelBridge is now live and fully managed on Render!**
