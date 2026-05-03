# ParcelBridge — Render & MongoDB Setup Guide

Follow these steps to get your platform live using **MongoDB Atlas** for the database and **Render** for hosting.

---

## 🍃 Part 1: MongoDB Atlas Setup (Database)

1.  **Create an Account**: Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2.  **Create a New Project**: Name it `ParcelBridge`.
3.  **Build a Cluster**:
    *   Choose the **FREE (M0)** tier.
    *   Select a provider (e.g., AWS) and region closest to you (e.g., Mumbai - `ap-south-1`).
    *   Click **Create**.
4.  **Security Quickstart**:
    *   **Authentication**: Create a Database User. Choose a username (e.g., `admin`) and a strong password. **Copy this password somewhere safe!**
    *   **Network Access**: Click "Add IP Address" → Choose **"Allow Access from Anywhere" (0.0.0.0/0)**. This is necessary for Render's dynamic IPs to connect.
5.  **Get Connection String**:
    *   Go to **Database** (on the sidebar).
    *   Click **Connect** on your cluster.
    *   Select **"Drivers"**.
    *   Copy the connection string (it looks like `mongodb+srv://admin:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`).
    *   **Save this!** Replace `<password>` with your actual database user password.

---

## ☁️ Part 2: Render Deployment (Full-Stack)

The repository already contains a `render.yaml` file, which makes setup much faster.

1.  **Connect GitHub**: Go to [dashboard.render.com](https://dashboard.render.com), sign in with GitHub, and give Render access to your `Startupidea-241094` repository.
2.  **Create Blueprint**:
    *   Click **"New"** (top right) → **"Blueprint"**.
    *   Select your repository `Sujith574/Startupidea-241094`.
    *   Render will read the `render.yaml` file and show two services: `parcelbridge-backend` and `parcelbridge-frontend`.
3.  **Configure Environment Variables**:
    Render will ask you to fill in variables for the **Backend**:
    *   `MONGODB_URI`: Paste your MongoDB connection string from Part 1.
    *   `JWT_SECRET`: `ahil ugod ltwu hlhh`
    *   `SMTP_PASS`: `ahil ugod ltwu hlhh`
    *   `SMTP_USER`: `sujithlavudu@gmail.com`
    *   (Other values like `NODE_ENV`, `PORT`, `EMAIL_FROM` are already set in the file).
4.  **Deploy**: Click **"Approve"**.
5.  **Final Step (Frontend URL)**:
    *   Wait for the **Backend** to finish deploying. Copy its URL (e.g., `https://parcelbridge-backend.onrender.com`).
    *   Go to the **Frontend service** settings in Render.
    *   Under **Environment**, add:
        *   `VITE_API_BASE_URL`: (Paste your Backend URL).
    *   Wait for the Frontend to rebuild and deploy.

---

## 🛠️ Part 3: Local Testing

To run the project on your own computer:

1.  **Open Terminal** in the `STARTUPIDEA` folder.
2.  **Backend**:
    ```bash
    cd backend
    npm install
    # Ensure your .env has the MONGODB_URI, JWT_SECRET, etc.
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
*   **Database**: Check your MongoDB Atlas "Collections" to see users being created.
*   **Admin Access**:
    *   Register your first user.
    *   Go to MongoDB Atlas → `users` collection.
    *   Edit that user document and change their `role` from `"user"` to `"admin"`.
    *   Refresh the website to see the Admin Dashboard.

---

📦 **ParcelBridge is now live!** Your code is safely stored at `https://github.com/Sujith574/Startupidea-241094`.
