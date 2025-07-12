import google.generativeai as genai
from typing import List, Dict, Optional, Union
import logging
import time
from tenacity import retry, stop_after_attempt, wait_exponential

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiFlashSummarizer:
    def __init__(self, api_key: str):
        """
        Initialize the Gemini 1.5 Flash summarizer
        
        Args:
            api_key: Your Gemini API key
        """
        try:
            # Configure the API with better timeout settings
            genai.configure(
                api_key=api_key,
                transport='rest',
                client_options={
                    'api_endpoint': 'generativelanguage.googleapis.com',
                    'timeout': 30.0
                }
            )
            
            # Initialize the model with specific generation config
            generation_config = {
                "temperature": 0.3,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
            
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            self.model = genai.GenerativeModel(
                'gemini-1.5-flash',
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            logger.info("Initialized Gemini 1.5 Flash model with optimized settings")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            raise RuntimeError(f"Could not initialize Gemini: {e}")

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def summarize(
        self,
        text: str,
        max_length: int = 300,
        temperature: float = 0.3,
        system_prompt: str = """You are an expert AI summarizer. Create a concise yet comprehensive summary that:
1. Preserves all key facts and figures
2. Maintains the original meaning
3. Is well-structured and readable
4. Approximately {max_length} characters in length"""
    ) -> Dict[str, Union[str, Dict]]:
        """
        Generate a high-quality summary using Gemini 1.5 Flash
        
        Args:
            text: Input text to summarize
            max_length: Target summary length in characters
            temperature: Controls creativity (0.0-1.0)
            system_prompt: Custom instructions for summarization
            
        Returns:
            Dictionary containing summary and metadata
        """
        try:
            start_time = time.time()
            
            # Enhanced prompt engineering
            prompt = f"""{system_prompt.format(max_length=max_length)}
            
            **Original Text:**
            {text}
            
            **Summary Requirements:**
            - Length: ~{max_length} characters
            - Include all key points
            - Maintain original tone
            - Use clear, concise language
            - Output ONLY the summary text"""
            
            # Generate with optimized parameters
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": int(max_length * 0.7),  # More accurate token estimation
                    "candidate_count": 1
                }
            )
            
            summary = response.text.strip()
            elapsed = time.time() - start_time
            
            return {
                "summary": summary,
                "details": {
                    "model": "gemini-1.5-flash",
                    "input_length": len(text),
                    "summary_length": len(summary),
                    "processing_time": round(elapsed, 2),
                    "compression_ratio": round(len(text)/len(summary), 1),
                    "parameters": {
                        "max_length": max_length,
                        "temperature": temperature
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Summarization failed: {str(e)}")
            raise  # Re-raise for retry

    def batch_summarize(
        self,
        texts: List[str],
        max_length: int = 300,
        batch_size: int = 5,
        **kwargs
    ) -> List[Dict]:
        """
        Efficient batch summarization with rate limiting
        
        Args:
            texts: List of texts to summarize
            max_length: Target summary length
            batch_size: Number of parallel requests
            kwargs: Additional parameters for summarize()
            
        Returns:
            List of summary results
        """
        results = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            try:
                batch_results = [self.summarize(text, max_length, **kwargs) for text in batch]
                results.extend(batch_results)
                time.sleep(1)  # Rate limiting
            except Exception as e:
                logger.error(f"Batch failed at index {i}: {str(e)}")
                # Add error placeholders for failed items
                results.extend({
                    "summary": "",
                    "error": str(e),
                    "details": {"input_text": text[:100] + "..."}
                } for text in batch)
        return results


# Example usage
if __name__ == "__main__":
    # Initialize with API key
    summarizer = GeminiFlashSummarizer(api_key="AIzaSyBY_zK-Jr2LgWZDWRrNFAqxfzbvBYS4tUk")
    
    # Test with your sample text
    sample_text = """
    The transformer architecture has become the dominant approach for natural language processing tasks. 
    Introduced in 2017, transformers use self-attention mechanisms to process all words in a sequence 
    simultaneously rather than sequentially. This allows for better parallelization and capture of 
    long-range dependencies in text. Modern implementations like BERT, GPT, and T5 have achieved 
    state-of-the-art results on numerous benchmarks. The key advantages include their ability to 
    handle variable-length inputs and their effectiveness at transfer learning.
    """
    
    # Single summary
    result = summarizer.summarize(
        sample_text,
        max_length=250,
        temperature=0.2
    )
    print(f"\nSummary (1 of 1):")
    print(f"Length: {len(result['summary'])} chars")
    print(f"Processing time: {result['details']['processing_time']}s")
    print(f"Compression: {result['details']['compression_ratio']}x")
    print("---\n" + result['summary'] + "\n---")
    
    # Batch processing
    texts = [
    """
    The Industrial Revolution, which began in Britain in the late 18th century, marked a major turning point in history. 
    This period saw the transition from manual production methods to machines, new chemical manufacturing and iron production 
    processes, improved efficiency of water power, the increasing use of steam power, and the development of machine tools. 
    It also included the change from wood and other bio-fuels to coal. The textile industry was transformed by new machines 
    like the spinning jenny and power loom. Transportation improved with steam-powered ships and railways. 
    These technological changes introduced novel ways of working and living and fundamentally transformed society. 
    The revolution spread throughout Europe and North America during the 19th century, eventually affecting most of the world.
    """,
    
    """
    Climate change refers to long-term shifts in temperatures and weather patterns. While these shifts can be natural, 
    since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil 
    fuels like coal, oil, and gas. This burning produces heat-trapping gases. The consequences of climate change now include, 
    among others, intense droughts, water scarcity, severe fires, rising sea levels, flooding, melting polar ice, catastrophic 
    storms, and declining biodiversity. According to the Intergovernmental Panel on Climate Change (IPCC), limiting global 
    warming to 1.5°C would require rapid, far-reaching and unprecedented changes in all aspects of society. Solutions to 
    climate change include renewable energy systems, enhanced energy efficiency, developing green infrastructure, and 
    adopting sustainable agricultural practices.
    """,
    
    """
    Artificial intelligence (AI) is transforming industries across the globe, from healthcare to finance to manufacturing. 
    AI refers to the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions. 
    The technology encompasses machine learning, where computer systems improve through experience, and deep learning, which uses 
    neural networks with many layers. Current applications include virtual assistants, image and speech recognition, medical 
    diagnosis, autonomous vehicles, and predictive analytics. While AI offers tremendous opportunities for economic growth and 
    solving complex problems, it also raises ethical concerns about privacy, bias in decision-making, job displacement, and 
    the potential misuse of autonomous weapons systems. Governments and organizations are working to establish ethical guidelines 
    for AI development and deployment.
    """,
    
    """
    The Renaissance was a fervent period of European cultural, artistic, political, and economic rebirth following the Middle Ages. 
    Generally described as taking place from the 14th century to the 17th century, the Renaissance promoted the rediscovery of 
    classical philosophy, literature, and art. Some of the greatest thinkers, authors, statesmen, scientists, and artists in 
    human history thrived during this era, while global exploration opened new lands and cultures to European commerce. 
    The Renaissance is perhaps best known for its artistic developments and the contributions of polymaths like Leonardo da Vinci 
    and Michelangelo, who embodied the Renaissance ideal of the "universal man." The invention of the printing press by Johannes 
    Gutenberg around 1440 helped spread Renaissance ideas throughout Europe more quickly than ever before.
    """,
    
    """
    Quantum computing represents a revolutionary approach to computation that leverages the principles of quantum mechanics. 
    Unlike classical computers that use bits (0s and 1s), quantum computers use quantum bits or qubits, which can exist in 
    superposition states and become entangled with each other. This allows quantum computers to process massive amounts of 
    information simultaneously and solve certain complex problems much faster than classical computers. Potential applications 
    include drug discovery, materials science, optimization problems, and cryptography. However, building practical quantum 
    computers faces significant technical challenges, including maintaining quantum coherence and reducing error rates. 
    Major technology companies and governments are investing heavily in quantum computing research, recognizing its potential 
    to transform fields from cybersecurity to financial modeling to artificial intelligence.
    """
]
    
    batch_results = summarizer.batch_summarize(texts, max_length=200)
    for i, res in enumerate(batch_results):
        print(f"\nSummary {i+1}:")
        if 'error' in res:
            print(f"Error: {res['error']}")
        else:
            print(f"Length: {len(res['summary'])} chars")
            print("---\n" + res['summary'] + "\n---")