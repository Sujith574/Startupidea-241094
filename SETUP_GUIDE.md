# 🚀 ParcelBridge — The Ultimate Render Setup Guide

This guide covers every single step to get your platform live on Render with its own PostgreSQL database. Follow these steps exactly to avoid any errors.

---

## 🏗️ Step 1: Push Your Latest Code to GitHub
(I have already done this for you, but keep your GitHub tab open).
**Repository**: `https://github.com/Sujith574/Startupidea-241094`

---

## ☁️ Step 2: Create a New Blueprint on Render

1.  **Login**: Go to [dashboard.render.com](https://dashboard.render.com) and log in with your GitHub account.
2.  **Start Blueprint**: 
    *   Click the **"New +"** button (top right).
    *   Select **"Blueprint"** from the dropdown menu.
3.  **Connect Repo**: 
    *   Find your repository: `Sujith574/Startupidea-241094`.
    *   Click **"Connect"**.
4.  **Configure Instance**:
    *   **Service Group Name**: Enter `ParcelBridge`.
    *   **Wait**: Render will read the `render.yaml` file. If I fixed the errors correctly, it will show you three services to create:
        *   `parcelbridge-db`
        *   `parcelbridge-backend`
        *   `parcelbridge-frontend`
5.  **Click "Approve"**: This will start the deployment process.

---

## ⚙️ Step 3: Configure Environment Variables

While the services are building, we need to make sure the Frontend can talk to the Backend.

1.  **Wait for the Backend URL**: 
    *   Go to your Render Dashboard.
    *   Click on the **`parcelbridge-backend`** service.
    *   Look for the URL at the top (it looks like `https://parcelbridge-backend-xxxx.onrender.com`).
    *   **Copy this URL!**
2.  **Update Frontend Settings**:
    *   Go back to the Render Dashboard.
    *   Click on the **`parcelbridge-frontend`** service.
    *   Click **"Environment"** in the left sidebar.
    *   Click **"Add Environment Variable"**.
    *   **Key**: `VITE_API_BASE_URL`
    *   **Value**: Paste the Backend URL you copied (e.g., `https://parcelbridge-backend-xxxx.onrender.com`).
    *   Click **"Save Changes"**.
3.  **Redeploy Frontend**:
    *   Go to the **"Events"** or **"Deploy"** tab for the frontend.
    *   Click **"Manual Deploy"** → **"Clear Cache & Deploy"**.

---

## 📧 Step 4: Verify Email & OTP

Your app is now live! 
1.  Open your **Frontend URL** (from the `parcelbridge-frontend` service).
2.  Click **"Login"**.
3.  Enter your email and click **"Send OTP"**.
4.  Check your Gmail inbox (from `sujithlavudu@gmail.com`) for the code.
    *   *Note: If you don't receive it, check that your Gmail App Password is still valid.*

---

## 👑 Step 5: Make Yourself an Admin

To access the Admin Dashboard, you need to change your role in the database.

1.  In Render, click on your **`parcelbridge-db`** service.
2.  Click **"Shell"** (or use any SQL client).
3.  Run this exact command (replace with your email):
    ```sql
    UPDATE "Users" SET role = 'admin' WHERE email = 'sujithlavudu@gmail.com';
    ```
4.  Refresh the ParcelBridge website. You will now see the "Admin" tab in the sidebar.

---

### 🆘 Common Issues
*   **Deployment Error**: Click "Retry" or "Deploy" if a service fails the first time. Sometimes Render needs a second try to link the database.
*   **Database URL**: The `DATABASE_URL` is automatically handled by the Blueprint. Do not change it manually unless you know what you are doing.

📦 **You are now a Logistics Startup Founder! Good luck!**
