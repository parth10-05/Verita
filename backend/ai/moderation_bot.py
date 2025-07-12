from detoxify import Detoxify
from typing import Dict, Union, List, Optional
import numpy as np
import logging
import re
import contractions
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ToxicityChecker:
    def __init__(self, model_type: str = 'original', threshold: float = 0.7, 
                 custom_weights: Optional[Dict[str, float]] = None,
                 banned_words: Optional[List[str]] = None):
        """
        Initialize toxicity detection model with enhanced configuration.
        
        Args:
            model_type: Type of Detoxify model ('original', 'unbiased', 'multilingual')
            threshold: Default toxicity threshold for flagging (0-1)
            custom_weights: Custom weights for toxicity dimensions
            banned_words: List of words that should automatically flag content
        """
        self.model = self._load_model(model_type)
        self.threshold = threshold
        self.supported_languages = ['en']  # Add more if using multilingual model
        self.banned_words = set(word.lower() for word in banned_words) if banned_words else None
        
        # Default weights for toxicity dimensions
        self.weights = {
            'toxicity': 0.2,
            'severe_toxicity': 0.3,
            'obscene': 0.1,
            'threat': 0.25,
            'insult': 0.1,
            'identity_attack': 0.25
        }
        
        if custom_weights:
            self.weights.update(custom_weights)
        
    def _load_model(self, model_type: str) -> Detoxify:
        """Safely load the Detoxify model with error handling"""
        try:
            logger.info(f"Loading Detoxify model: {model_type}")
            return Detoxify(model_type)
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise RuntimeError(f"Could not initialize toxicity detector: {e}")
    
    def preprocess_text(self, text: str) -> str:
        """Enhanced text preprocessing"""
        if not isinstance(text, str):
            raise ValueError("Input must be a string")
            
        text = text.strip()
        if not text:
            return text
            
        # Convert to lowercase
        text = text.lower()
        
        # Fix contractions
        try:
            text = contractions.fix(text)
        except:
            pass
            
        # Remove special characters except basic punctuation
        text = re.sub(r"[^\w\s.,!?']", "", text)
        
        return text
    
    def _calculate_toxicity_score(self, results: Dict[str, float]) -> float:
        """Calculate weighted toxicity score"""
        return sum(results[dim] * weight for dim, weight in self.weights.items())
    
    def _contains_banned_words(self, text: str) -> bool:
        """Check if text contains any banned words"""
        if not self.banned_words:
            return False
            
        text_lower = text.lower()
        return any(banned_word in text_lower for banned_word in self.banned_words)
    
    def check_toxicity(self, text: str, threshold: float = None) -> Dict[str, Union[bool, float, dict, str]]:
        """
        Enhanced toxicity analysis with banned words check and weighted scoring.
        
        Args:
            text: Input text to analyze
            threshold: Custom threshold for flagging (overrides default)
            
        Returns:
            Dictionary containing:
            - flagged: boolean if text is toxic
            - toxicity_score: primary toxicity score (0-1)
            - detailed_scores: all toxicity dimension scores
            - threshold: threshold used for flagging
            - text_length: length of processed text
            - triggered_banned_words: list of banned words found (if any)
            - error: error message (if any)
        """
        try:
            # Validate and preprocess input
            clean_text = self.preprocess_text(text)
            if not clean_text:
                return {
                    "flagged": False,
                    "toxicity_score": 0.0,
                    "detailed_scores": {},
                    "threshold": threshold or self.threshold,
                    "text_length": 0,
                    "triggered_banned_words": [],
                    "error": "Empty text input"
                }
            
            # Check for banned words first
            triggered_banned_words = []
            if self.banned_words:
                triggered_banned_words = [
                    word for word in self.banned_words 
                    if word in clean_text.lower()
                ]
            
            # Get toxicity predictions
            results = self.model.predict(clean_text)
            
            # Use provided threshold or default
            current_threshold = threshold if threshold is not None else self.threshold
            
            # Calculate weighted toxicity score
            toxic_score = self._calculate_toxicity_score(results)
            
            # Determine if content should be flagged
            flagged = (toxic_score > current_threshold) or bool(triggered_banned_words)
            
            # If banned words triggered, boost the toxicity score
            if triggered_banned_words:
                toxic_score = max(toxic_score, 0.8)  # Minimum score when banned words found
            
            return {
                "flagged": flagged,
                "toxicity_score": float(toxic_score),
                "detailed_scores": {k: float(v) for k, v in results.items()},
                "threshold": current_threshold,
                "text_length": len(clean_text),
                "triggered_banned_words": triggered_banned_words,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error analyzing toxicity: {e}", exc_info=True)
            return {
                "flagged": False,
                "toxicity_score": 0.0,
                "detailed_scores": {},
                "threshold": threshold or self.threshold,
                "text_length": 0,
                "triggered_banned_words": [],
                "error": str(e)
            }
    
    def batch_check(self, texts: List[str], threshold: float = None) -> List[Dict[str, Union[bool, float, dict, str]]]:
        """
        Analyze multiple texts for toxicity more efficiently.
        
        Args:
            texts: List of text strings to analyze
            threshold: Custom threshold for flagging
            
        Returns:
            List of result dictionaries for each text
        """
        if not isinstance(texts, list):
            raise ValueError("Input must be a list of strings")
            
        return [self.check_toxicity(text, threshold) for text in texts]


# Example usage
if __name__ == "__main__":
    # Initialize with custom configuration
    checker = ToxicityChecker(
        model_type='unbiased',
        threshold=0.6,
        banned_words=["dumb", "idiot", "stupid"],
        custom_weights={
            'severe_toxicity': 0.4,
            'identity_attack': 0.3,
            'threat': 0.3
        }
    )
    
    # Test cases
    sample_texts = [
        "Your question is very dumb. how are you not in playschool?",
        "This is a perfectly normal comment.",
        "I respectfully disagree with your opinion.",
        "You're an idiot who shouldn't be allowed to post here!"
    ]
    
    # Process all texts
    for text in sample_texts:
        result = checker.check_toxicity(text)
        print(f"\nText: {text}")
        print(f"Result: {result}")