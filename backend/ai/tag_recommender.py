from keybert import KeyBERT
from sklearn.feature_extraction.text import CountVectorizer
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import string
import numpy as np
nltk.download('punkt_tab', quiet=True)

# Download required NLTK data
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('punkt')

# Initialize components
kw_model = KeyBERT()
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))
punctuation = set(string.punctuation)

def preprocess_text(text):
    """Enhanced text preprocessing"""
    # Lowercase
    text = text.lower()
    # Remove punctuation
    text = ''.join([char for char in text if char not in punctuation])
    # Tokenize and lemmatize
    tokens = nltk.word_tokenize(text)
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    # Remove stopwords and short tokens
    tokens = [token for token in tokens if token not in stop_words and len(token) > 2]
    return ' '.join(tokens)

def recommend_tags(title, description, available_tags, top_n=15, threshold=0.2):
    """Improved tag recommendation system"""
    # Combine and preprocess text
    text = f"{title} {description}"
    processed_text = preprocess_text(text)
    
    # Prepare available tags (preprocessed for matching)
    processed_tags = {tag: preprocess_text(tag) for tag in available_tags}
    
    # Extract keywords with enhanced parameters
    keywords = kw_model.extract_keywords(
        processed_text,
        keyphrase_ngram_range=(1, 3),  # Allow up to 3-word phrases
        stop_words='english',
        top_n=top_n,
        use_mmr=True,  # Use Maximal Marginal Relevance for diversity
        diversity=0.5,  # Balance between relevance and diversity
        vectorizer=CountVectorizer(ngram_range=(1, 3))  # Match the ngram range
    )
    # Filter keywords by confidence threshold
    keywords = [kw for kw in keywords if kw[1] >= threshold]
    
    # Prepare keyword set (lemmatized and lowercased)
    keyword_set = set(k[0].lower() for k in keywords)
    
    # Find matches with processed tags
    matched = []
    for tag, processed_tag in processed_tags.items():
        # Check for direct matches or subset matches
        if (processed_tag in keyword_set or 
            any(processed_tag in kw for kw in keyword_set) or
            any(kw in processed_tag for kw in keyword_set)):
            matched.append(tag)
    
    # Sort by relevance (optional)
    if matched and keywords:
        # Create a relevance score for each matched tag
        tag_scores = {}
        for tag in matched:
            processed_tag = processed_tags[tag]
            # Find the maximum similarity score for this tag
            max_score = max([score for kw, score in keywords 
                           if processed_tag in kw or kw in processed_tag], default=0)
            tag_scores[tag] = max_score
        
        # Sort tags by their highest matching score
        matched = sorted(matched, key=lambda x: tag_scores[x], reverse=True)
    
    return matched