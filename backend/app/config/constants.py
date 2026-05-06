# Crop labels — output classes for crop recommendation model
CROP_LABELS = [
    "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas",
    "mothbeans", "mungbean", "blackgram", "lentil", "pomegranate",
    "banana", "mango", "grapes", "watermelon", "muskmelon",
    "apple", "orange", "papaya", "coconut", "cotton", "jute", "coffee"
]

# Soil types
SOIL_TYPES = ["sandy", "loamy", "black", "red", "clayey"]

# Season types
SEASONS = ["kharif", "rabi", "zaid"]

# Disease model input size
DISEASE_IMAGE_SIZE = (224, 224)

# API response messages
MSG_SUCCESS = "success"
MSG_ERROR = "error"