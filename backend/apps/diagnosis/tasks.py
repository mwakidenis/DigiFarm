"""
Celery tasks for crop image diagnosis.
"""
import os
import json
from celery import shared_task
from django.conf import settings
from .models import CropImage, DiagnosisResult


@shared_task(bind=True, max_retries=3)
def diagnose_image(self, crop_image_id):
    """
    Process a crop image and generate diagnosis.
    
    This is a mock implementation. In production, this would:
    1. Load the image from storage (local or S3)
    2. Preprocess the image
    3. Call ML inference service or run model locally
    4. Parse results and generate recommendations
    5. Save DiagnosisResult
    
    For now, it uses a simple rule-based classifier for demonstration.
    """
    try:
        crop_image = CropImage.objects.get(id=crop_image_id)
        crop_image.status = 'processing'
        crop_image.save()
        
        # Mock ML inference - replace with actual model call
        # Example: call external API or run TensorFlow/PyTorch model
        result = mock_crop_diagnosis(crop_image)
        
        # Create diagnosis result
        diagnosis = DiagnosisResult.objects.create(
            crop_image=crop_image,
            predicted_label=result['label'],
            confidence=result['confidence'],
            recommendations=result['recommendations'],
            model_version='v1.0-mock'
        )
        
        crop_image.status = 'processed'
        crop_image.save()
        
        return {
            'crop_image_id': crop_image_id,
            'diagnosis_id': diagnosis.id,
            'status': 'success'
        }
    
    except CropImage.DoesNotExist:
        return {'error': f'CropImage {crop_image_id} not found'}
    except Exception as exc:
        # Update status to failed
        try:
            crop_image = CropImage.objects.get(id=crop_image_id)
            crop_image.status = 'failed'
            crop_image.save()
        except:
            pass
        
        # Retry the task
        raise self.retry(exc=exc, countdown=60)


def mock_crop_diagnosis(crop_image):
    """
    Mock diagnosis function that simulates ML model inference.
    
    In production, replace this with:
    - API call to ML inference service
    - Local model inference (TensorFlow/PyTorch)
    - Or integrate with cloud ML services (AWS SageMaker, Google AI Platform, etc.)
    """
    # Simple rule-based mock classifier
    # In reality, this would analyze the image pixels/features
    
    # Mock predictions based on filename or simple heuristics
    filename = crop_image.image.name.lower()
    
    # Heuristic: Check filename for "sick" to force a specific detailed result
    if 'sick' in filename or 'issue' in filename or 'blight' in filename:
        return {
            'label': 'Early Blight (Alternaria solani)',
            'confidence': 0.98,
            'recommendations': {
                'issue': 'Severe fungal infection identified as Early Blight. Characterized by concentric ring patterns on leaves and fruit rot.',
                'severity': 'high',
                'treatment': [
                    'IMMEDIATE ACTION: Remove and burn all infected lower leaves to stop upward spread.',
                    'Apply fungicide containing Chlorothalonil or Mancozeb every 7 days.',
                    'Copper-based fungicides are effective organic alternatives.',
                    'Improve air circulation by pruning excess foliage.',
                    'Water only at the base of the plant to keep leaves dry.'
                ],
                'prevention': [
                    'Implement 3-year crop rotation (avoid planting solanaceous crops in same spot).',
                    'Mulch soil to prevent spores from splashing onto leaves.',
                    'Use certified disease-free seeds.',
                    'Drip irrigation is highly recommended.'
                ],
                'recommended_products': [
                    {'name': 'Daconil Fungicide', 'category': 'fungicide'},
                    {'name': 'Liquid Copper Fungicide', 'category': 'organic-fungicide'},
                ],
                'timeline': 'With immediate treatment, spread can be contained in 3-5 days. Infected leaves will not recover.'
            }
        }
    
    # Mock disease/issue predictions
    mock_results = [
        {
            'label': 'Aphids Infestation',
            'confidence': 0.85,
            'recommendations': {
                'issue': 'Aphids are small insects that feed on plant sap, causing yellowing and stunted growth.',
                'severity': 'moderate',
                'treatment': [
                    'Spray with soap solution (2 tablespoons liquid soap per gallon of water)',
                    'Apply approved insecticide such as neem oil or pyrethrin-based products',
                    'Remove heavily infested leaves',
                    'Introduce beneficial insects like ladybugs',
                    'Ensure proper plant spacing for air circulation'
                ],
                'prevention': [
                    'Regular monitoring of plants',
                    'Crop rotation',
                    'Maintain healthy soil with proper nutrients',
                    'Use companion planting with repellent plants'
                ],
                'recommended_products': [
                    {'name': 'Neem Oil Insecticide', 'category': 'pesticide'},
                    {'name': 'Organic Soap Spray', 'category': 'pesticide'},
                ],
                'timeline': 'Treatment should show results within 1-2 weeks'
            }
        },
        {
            'label': 'Leaf Blight',
            'confidence': 0.78,
            'recommendations': {
                'issue': 'Fungal disease causing brown spots and leaf death.',
                'severity': 'high',
                'treatment': [
                    'Remove and destroy infected leaves immediately',
                    'Apply fungicide containing copper or chlorothalonil',
                    'Improve air circulation around plants',
                    'Avoid overhead watering',
                    'Apply treatment every 7-10 days until resolved'
                ],
                'prevention': [
                    'Water at base of plants, not on leaves',
                    'Ensure proper spacing',
                    'Use disease-resistant varieties',
                    'Practice crop rotation'
                ],
                'recommended_products': [
                    {'name': 'Copper Fungicide', 'category': 'fungicide'},
                    {'name': 'Chlorothalonil Spray', 'category': 'fungicide'},
                ],
                'timeline': 'Treatment should show improvement within 2-3 weeks'
            }
        },
        {
            'label': 'Nitrogen Deficiency',
            'confidence': 0.72,
            'recommendations': {
                'issue': 'Plants showing yellowing leaves, indicating lack of nitrogen.',
                'severity': 'moderate',
                'treatment': [
                    'Apply nitrogen-rich fertilizer (NPK 20-10-10 or similar)',
                    'Use organic options like compost or manure',
                    'Side-dress plants with nitrogen fertilizer',
                    'Ensure proper soil pH (6.0-7.0) for nutrient uptake'
                ],
                'prevention': [
                    'Regular soil testing',
                    'Maintain balanced fertilization schedule',
                    'Use cover crops to fix nitrogen',
                    'Practice crop rotation with legumes'
                ],
                'recommended_products': [
                    {'name': 'NPK 20-10-10 Fertilizer', 'category': 'fertilizer'},
                    {'name': 'Organic Compost', 'category': 'fertilizer'},
                ],
                'timeline': 'Improvement visible within 1-2 weeks of application'
            }
        },
        {
            'label': 'Healthy Crop',
            'confidence': 0.90,
            'recommendations': {
                'issue': 'No significant issues detected. Crop appears healthy.',
                'severity': 'none',
                'treatment': [
                    'Continue current care practices',
                    'Maintain regular monitoring',
                    'Ensure adequate water and nutrients'
                ],
                'prevention': [
                    'Continue good agricultural practices',
                    'Regular crop monitoring',
                    'Maintain soil health',
                    'Practice integrated pest management'
                ],
                'recommended_products': [],
                'timeline': 'Continue monitoring'
            }
        }
    ]
    
    # Simple heuristic: use filename or random selection for demo
    import random
    result = random.choice(mock_results)
    
    # In production, replace with actual model inference:
    # from tensorflow import keras
    # model = keras.models.load_model('path/to/model.h5')
    # image = preprocess_image(crop_image.image.path)
    # prediction = model.predict(image)
    # result = parse_prediction(prediction)
    
    return result

