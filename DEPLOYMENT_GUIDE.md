# 🚀 Complete Deployment Guide - Savitr Delivery System

## **Platforms Used (All FREE)**
- **MongoDB Atlas** - Database
- **Vercel** - savitr-delivery-manager (Next.js)
- **Netlify** - indiapost-clone (React)
- **Railway** - savitr_ai (Flask API)

---

## **Step 1: MongoDB Atlas (Database)**

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create account
3. Choose "Free" plan (M0)

### 1.2 Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS/Google Cloud/Azure)
4. Choose region closest to you
5. Click "Create"

### 1.3 Set Up Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `SavitrNew`

**Example:**
```
mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/SavitrNew?retryWrites=true&w=majority
```

---

## **Step 2: Deploy savitr-delivery-manager to Vercel**

### 2.1 Create Vercel Account
1. Go to [Vercel](https://vercel.com)
2. Sign in with GitHub
3. Authorize Vercel to access your repositories

### 2.2 Deploy Project
1. Click "New Project"
2. Import your repository: `duttasayan835/savitr-delivery-system`
3. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `savitr-delivery-manager`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

### 2.3 Add Environment Variables
Click "Environment Variables" and add:

```
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/SavitrNew?retryWrites=true&w=majority
NEXTAUTH_SECRET=your_secure_secret_here_make_it_long_and_random
NEXTAUTH_URL=https://your-app.vercel.app
JWT_SECRET=your_jwt_secret_here_make_it_long_and_random
ADMIN_SECRET_CODE=your_admin_code_here
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here
TWILIO_PHONE_NUMBER=your_twilio_number_here
SEND_REAL_SMS_IN_DEV=false
SEND_MOCK_NOTIFICATIONS=true
NODE_ENV=production
```

### 2.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your Vercel URL (e.g., `https://savitr-delivery-system.vercel.app`)

---

## **Step 3: Deploy indiapost-clone to Netlify**

### 3.1 Create Netlify Account
1. Go to [Netlify](https://netlify.com)
2. Sign in with GitHub
3. Authorize Netlify to access your repositories

### 3.2 Deploy Project
1. Click "Add new site" → "Import an existing project"
2. Connect your GitHub repository: `duttasayan835/savitr-delivery-system`
3. Configure build settings:
   - **Base directory:** `indiapost-clone`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click "Deploy site"

### 3.3 Custom Domain (Optional)
1. Go to "Domain settings"
2. Click "Change site name"
3. Choose a custom name (e.g., `indiapost-clone-savitr`)

---

## **Step 4: Deploy savitr_ai to Railway**

### 4.1 Create Railway Account
1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Authorize Railway to access your repositories

### 4.2 Deploy Project
1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository: `duttasayan835/savitr-delivery-system`
3. Configure deployment:
   - **Root Directory:** `savitr_ai`
   - **Environment:** Python (auto-detected)

### 4.3 Add Environment Variables
Go to "Variables" tab and add:

```
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/SavitrNew?retryWrites=true&w=majority
FLASK_ENV=production
```

### 4.4 Deploy
1. Railway will automatically detect the Python app
2. It will install dependencies from `requirements.txt`
3. It will start the app using the `Procfile`
4. Wait for deployment to complete
5. Note your Railway URL (e.g., `https://savitr-ai-production.up.railway.app`)

---

## **Step 5: Update Environment Variables**

### 5.1 Update Vercel Environment Variables
After getting your Railway URL, update the Vercel environment variables:

```
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
```

### 5.2 Redeploy if Needed
- Vercel will automatically redeploy when you update environment variables
- Or manually trigger a redeploy from the Vercel dashboard

---

## **Step 6: Test Your Deployment**

### 6.1 Test Each Component
1. **Vercel App:** Visit your Vercel URL and test the delivery manager
2. **Netlify App:** Visit your Netlify URL and test the India Post clone
3. **Railway API:** Test the Flask API endpoints

### 6.2 Integration Testing
1. Test the connection between India Post clone and delivery manager
2. Test the API integration between delivery manager and Flask API
3. Test the database connections

---

## **Final URLs Structure**

After deployment, you'll have:

- **savitr-delivery-manager:** `https://your-app.vercel.app`
- **indiapost-clone:** `https://your-app.netlify.app`
- **savitr_ai:** `https://your-app.railway.app`

---

## **Troubleshooting**

### Common Issues:
1. **MongoDB Connection:** Ensure your IP is whitelisted in Atlas
2. **Environment Variables:** Double-check all variables are set correctly
3. **Build Errors:** Check the deployment logs for any missing dependencies
4. **CORS Issues:** Ensure URLs are correctly configured

### Support:
- Check deployment logs in each platform's dashboard
- Verify environment variables are set correctly
- Test each component individually before integration 