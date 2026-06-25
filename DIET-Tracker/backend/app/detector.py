import cv2
import numpy as np
from PIL import Image
import io
import os
import json

HAS_TORCH = False

class FoodDetector:
    def __init__(self):
        self.device = None
        self.processor = None
        self.model = None
        self.label_map = None
        self.use_mock = not HAS_TORCH
        
        if HAS_TORCH:
            try:
                model_path = os.path.join(os.path.dirname(__file__), "..", "models", "deit-food101")
                
                if os.path.exists(model_path) and os.path.exists(os.path.join(model_path, "config.json")):
                    print(f"Loading trained model from {model_path}")
                    self.processor = DeiTImageProcessor.from_pretrained(model_path)
                    self.model = DeiTForImageClassification.from_pretrained(model_path)
                    
                    label_map_path = os.path.join(model_path, "label_map.json")
                    if os.path.exists(label_map_path):
                        with open(label_map_path, 'r') as f:
                            self.label_map = json.load(f)
                            self.label_map = {int(k): v for k, v in self.label_map.items()}
                else:
                    print("Using base model - trained model not found")
                    model_name = "facebook/deit-base-distilled-patch16-224"
                    self.processor = DeiTImageProcessor.from_pretrained(model_name)
                    self.model = DeiTForImageClassification.from_pretrained(model_name)
                    self.label_map = self.model.config.id2label
                
                self.device = "cuda" if torch.cuda.is_available() else "cpu"
                self.model.to(self.device)
                self.model.eval()
                self.use_mock = False
            except Exception as e:
                print(f"Failed to load model: {e}. Using mock predictions.")
                self.use_mock = True
        
        self.nutrition_db = self._load_nutrition_data()
        self.mock_foods = ["apple_pie", "beignets", "pizza", "sushi", "tacos", "ramen", "tiramisu", "waffles"]

    def _load_nutrition_data(self):
        """Load nutrition data for all Food-101 classes (per 100g)"""
        return {
            "apple_pie": {"calories": 239, "protein": 1.6, "carbs": 34, "fat": 10.8},
            "baby_back_ribs": {"calories": 293, "protein": 25, "carbs": 0, "fat": 22},
            "baklava": {"calories": 463, "protein": 8.9, "carbs": 48, "fat": 25},
            "beef_carpaccio": {"calories": 231, "protein": 21, "carbs": 0, "fat": 17},
            "beef_tartare": {"calories": 231, "protein": 21, "carbs": 0, "fat": 17},
            "beet_salad": {"calories": 95, "protein": 4.6, "carbs": 17, "fat": 0.5},
            "beignets": {"calories": 320, "protein": 5.2, "carbs": 36, "fat": 16},
            "bibimbap": {"calories": 176, "protein": 6.8, "carbs": 31, "fat": 2.8},
            "bread_pudding": {"calories": 233, "protein": 5.5, "carbs": 30, "fat": 10},
            "breakfast_burrito": {"calories": 252, "protein": 11, "carbs": 25, "fat": 11},
            "bruschetta": {"calories": 145, "protein": 5.5, "carbs": 20, "fat": 4.5},
            "caesar_salad": {"calories": 125, "protein": 6, "carbs": 10, "fat": 7},
            "cannoli": {"calories": 329, "protein": 5.5, "carbs": 42, "fat": 16},
            "caprese_salad": {"calories": 95, "protein": 5.8, "carbs": 6.5, "fat": 6},
            "carrot_cake": {"calories": 355, "protein": 4.5, "carbs": 50, "fat": 16},
            "ceviche": {"calories": 83, "protein": 16, "carbs": 3, "fat": 1.5},
            "cheese_plate": {"calories": 350, "protein": 25, "carbs": 2, "fat": 28},
            "cheesecake": {"calories": 321, "protein": 5.5, "carbs": 26, "fat": 22},
            "chicken_curry": {"calories": 181, "protein": 19, "carbs": 12, "fat": 6},
            "chicken_quesadilla": {"calories": 231, "protein": 18, "carbs": 20, "fat": 10},
            "chicken_wings": {"calories": 290, "protein": 30, "carbs": 0, "fat": 17},
            "chocolate_cake": {"calories": 355, "protein": 4.5, "carbs": 50, "fat": 16},
            "chocolate_mousse": {"calories": 250, "protein": 4, "carbs": 24, "fat": 14},
            "churros": {"calories": 365, "protein": 3.5, "carbs": 40, "fat": 21},
            "clam_chowder": {"calories": 149, "protein": 8, "carbs": 15, "fat": 5},
            "club_sandwich": {"calories": 321, "protein": 17, "carbs": 32, "fat": 14},
            "crab_cakes": {"calories": 217, "protein": 18, "carbs": 15, "fat": 10},
            "creme_brulee": {"calories": 283, "protein": 3.5, "carbs": 35, "fat": 14},
            "croque_madame": {"calories": 315, "protein": 18, "carbs": 28, "fat": 15},
            "cup_cakes": {"calories": 319, "protein": 3, "carbs": 42, "fat": 15},
            "deviled_eggs": {"calories": 178, "protein": 14, "carbs": 3, "fat": 12},
            "donuts": {"calories": 432, "protein": 3.8, "carbs": 51, "fat": 24},
            "dumplings": {"calories": 184, "protein": 6.5, "carbs": 26, "fat": 7},
            "edamame": {"calories": 111, "protein": 11, "carbs": 10, "fat": 5},
            "eggs_benedict": {"calories": 276, "protein": 14, "carbs": 20, "fat": 16},
            "escargots": {"calories": 155, "protein": 28, "carbs": 2, "fat": 3.5},
            "falafel": {"calories": 333, "protein": 13, "carbs": 29, "fat": 17},
            "filet_mignon": {"calories": 250, "protein": 26, "carbs": 0, "fat": 15},
            "fish_and_chips": {"calories": 256, "protein": 18, "carbs": 30, "fat": 9},
            "foie_gras": {"calories": 462, "protein": 7.6, "carbs": 0, "fat": 47},
            "french_fries": {"calories": 365, "protein": 3.4, "carbs": 48, "fat": 17},
            "french_onion_soup": {"calories": 112, "protein": 7, "carbs": 13, "fat": 4},
            "french_toast": {"calories": 272, "protein": 9.5, "carbs": 35, "fat": 11},
            "fried_calamari": {"calories": 241, "protein": 23, "carbs": 20, "fat": 9},
            "fried_rice": {"calories": 166, "protein": 5.8, "carbs": 26, "fat": 4.2},
            "frozen_yogurt": {"calories": 127, "protein": 3.5, "carbs": 24, "fat": 1},
            "garlic_bread": {"calories": 334, "protein": 9, "carbs": 41, "fat": 15},
            "gnocchi": {"calories": 106, "protein": 4, "carbs": 21, "fat": 0.5},
            "greek_salad": {"calories": 121, "protein": 4.3, "carbs": 12, "fat": 6},
            "grilled_cheese_sandwich": {"calories": 352, "protein": 16, "carbs": 32, "fat": 18},
            "grilled_salmon": {"calories": 280, "protein": 25, "carbs": 0, "fat": 20},
            "guacamole": {"calories": 160, "protein": 2, "carbs": 9, "fat": 15},
            "gyoza": {"calories": 133, "protein": 5.5, "carbs": 18, "fat": 5},
            "hamburger": {"calories": 354, "protein": 17, "carbs": 33, "fat": 15},
            "hot_and_sour_soup": {"calories": 88, "protein": 7, "carbs": 10, "fat": 2},
            "hot_dog": {"calories": 280, "protein": 14, "carbs": 22, "fat": 16},
            "huevos_rancheros": {"calories": 189, "protein": 12, "carbs": 15, "fat": 9},
            "hummus": {"calories": 168, "protein": 7.5, "carbs": 14, "fat": 9},
            "ice_cream": {"calories": 207, "protein": 3.5, "carbs": 24, "fat": 11},
            "lasagna": {"calories": 176, "protein": 9, "carbs": 23, "fat": 5},
            "lobster_bisque": {"calories": 119, "protein": 7, "carbs": 12, "fat": 5},
            "lobster_roll_sandwich": {"calories": 281, "protein": 20, "carbs": 25, "fat": 12},
            "macaroni_and_cheese": {"calories": 206, "protein": 8.5, "carbs": 24, "fat": 9},
            "macarons": {"calories": 435, "protein": 3.5, "carbs": 56, "fat": 21},
            "miso_soup": {"calories": 46, "protein": 3.8, "carbs": 5, "fat": 1.4},
            "mussels": {"calories": 172, "protein": 18, "carbs": 7, "fat": 9},
            "nachos": {"calories": 271, "protein": 9, "carbs": 29, "fat": 14},
            "omelette": {"calories": 154, "protein": 14, "carbs": 1, "fat": 11},
            "onion_rings": {"calories": 295, "protein": 3.5, "carbs": 34, "fat": 16},
            "oysters": {"calories": 81, "protein": 9, "carbs": 4.7, "fat": 2.3},
            "pad_thai": {"calories": 357, "protein": 14, "carbs": 34, "fat": 17},
            "paella": {"calories": 125, "protein": 4.5, "carbs": 20, "fat": 3},
            "pancakes": {"calories": 227, "protein": 5, "carbs": 35, "fat": 7},
            "panna_cotta": {"calories": 267, "protein": 2.5, "carbs": 28, "fat": 16},
            "peking_duck": {"calories": 337, "protein": 28, "carbs": 0, "fat": 25},
            "pho": {"calories": 95, "protein": 8.5, "carbs": 14, "fat": 0.8},
            "pizza": {"calories": 285, "protein": 12, "carbs": 36, "fat": 10},
            "pork_chop": {"calories": 242, "protein": 27, "carbs": 0, "fat": 14},
            "poutine": {"calories": 328, "protein": 8, "carbs": 36, "fat": 16},
            "prime_rib": {"calories": 355, "protein": 27, "carbs": 0, "fat": 28},
            "pulled_pork_sandwich": {"calories": 309, "protein": 20, "carbs": 28, "fat": 13},
            "ramen": {"calories": 190, "protein": 10, "carbs": 22, "fat": 7},
            "ravioli": {"calories": 142, "protein": 5.5, "carbs": 22, "fat": 3.5},
            "red_velvet_cake": {"calories": 318, "protein": 3.5, "carbs": 48, "fat": 14},
            "risotto": {"calories": 190, "protein": 6.5, "carbs": 28, "fat": 6},
            "samosa": {"calories": 227, "protein": 4.5, "carbs": 25, "fat": 12},
            "sashimi": {"calories": 149, "protein": 25, "carbs": 0, "fat": 5},
            "scallops": {"calories": 112, "protein": 21, "carbs": 5, "fat": 1.5},
            "seaweed_salad": {"calories": 54, "protein": 1.5, "carbs": 11, "fat": 0.3},
            "shrimp_and_grits": {"calories": 218, "protein": 15, "carbs": 20, "fat": 10},
            "spaghetti_bolognese": {"calories": 164, "protein": 9, "carbs": 23, "fat": 4},
            "spaghetti_carbonara": {"calories": 276, "protein": 14, "carbs": 30, "fat": 12},
            "spring_rolls": {"calories": 154, "protein": 4, "carbs": 20, "fat": 7},
            "steak": {"calories": 271, "protein": 26, "carbs": 0, "fat": 18},
            "strawberry_shortcake": {"calories": 247, "protein": 3.5, "carbs": 42, "fat": 8},
            "sushi": {"calories": 140, "protein": 5, "carbs": 24, "fat": 2},
            "tacos": {"calories": 226, "protein": 12, "carbs": 28, "fat": 8},
            "takoyaki": {"calories": 187, "protein": 7, "carbs": 24, "fat": 8},
            "tiramisu": {"calories": 312, "protein": 5.5, "carbs": 40, "fat": 16},
            "tuna_tartare": {"calories": 137, "protein": 23, "carbs": 0, "fat": 5},
            "waffles": {"calories": 276, "protein": 5, "carbs": 37, "fat": 12},
        }

    def preprocess_image(self, image_bytes):
        """Convert image bytes to PIL Image, resized to 224x224"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image = image.convert("RGB")
            image = image.resize((224, 224), Image.LANCZOS)
            return image
        except:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            img = cv2.resize(img, (224, 224))
            return Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

    def _get_nutrition(self, food_name):
        """Get nutrition info with fuzzy matching"""
        food_lower = food_name.lower().replace(" ", "_").replace("-", "_")
        
        # Direct match
        if food_lower in self.nutrition_db:
            return self.nutrition_db[food_lower]
        
        # Partial match
        for key in self.nutrition_db:
            if key in food_lower or food_lower in key:
                return self.nutrition_db[key]
        
        # If still not found, provide default nutrition info
        return {"calories": 200, "protein": 10, "carbs": 25, "fat": 8}

    def detect(self, image_bytes):
        """Analyze food in image and return prediction with nutrition info"""
        try:
            # Preprocess image
            pil_img = self.preprocess_image(image_bytes)
            
            if self.use_mock:
                # Return mock prediction
                import random
                food_name = random.choice(self.mock_foods)
                confidence = round(random.uniform(0.7, 0.99) * 100, 2)
            else:
                # Use real model
                inputs = self.processor(images=pil_img, return_tensors="pt")
                pixel_values = inputs["pixel_values"].to(self.device)
                
                with torch.no_grad():
                    outputs = self.model(pixel_values=pixel_values)
                    logits = outputs.logits
                    pred_idx = logits.argmax(-1).item()
                    confidence = torch.softmax(logits, dim=-1)[0][pred_idx].item()
                
                food_name = self.label_map.get(pred_idx, f"Unknown (ID: {pred_idx})")
                confidence = round(confidence * 100, 2)
            
            # Get nutrition data
            nutrition = self._get_nutrition(food_name)
            
            return {
                "food": food_name,
                "confidence": confidence,
                "nutrition": nutrition,
                "mode": "mock" if self.use_mock else "trained"
            }
        except Exception as e:
            return {
                "error": str(e),
                "food": "Error",
                "nutrition": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
                "mode": "error"
            }
