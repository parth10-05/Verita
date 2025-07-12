from tag_recommender import recommend_tags
title = "How do I protect API routes using JWT in a React app?"
description = """
    I'm building a single-page app using React and want to implement authentication.
    Users log in via a form and receive a JWT. How should I store the token, and 
    how do I send it in future requests to secure endpoints?
    """
    
available_tags = ["React", "JWT", "Authentication", "Token Storage", "API Security", "Node.js", "MongoDB"]

predicted_tags = recommend_tags(title, description, available_tags)
print("✅ Recommended Tags:", predicted_tags)