#!/bin/bash
# ═══════════════════════════════════════════════════════════
# ParcelBridge — Backend Deployment Script (Cloud Run)
# ═══════════════════════════════════════════════════════════

set -e

PROJECT_ID="startupidea-241094"
SERVICE_NAME="parcelbridge-backend"
REGION="us-central1"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying ParcelBridge Backend to Cloud Run..."
echo "   Project: ${PROJECT_ID}"
echo "   Service: ${SERVICE_NAME}"
echo "   Region:  ${REGION}"
echo ""

# Build and push image
echo "📦 Building Docker image..."
gcloud builds submit --tag "${IMAGE}" .

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars "FIREBASE_PROJECT_ID=${PROJECT_ID},NODE_ENV=production,PLATFORM_FEE_PERCENT=10"

echo ""
echo "✅ Backend deployed successfully!"
echo "   Service URL: $(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')"
