import json
import hashlib
import os
import time
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

class PromptCache:
    """
    Prompt caching system for ECHO2.
    Implements caching for prompt responses with TTL and content-based hashing.
    """
    def __init__(self, cache_dir: str = "/tmp/ECHO2/cache", ttl_hours: int = 24):
        self.cache_dir = cache_dir
        self.ttl = timedelta(hours=ttl_hours)
        self._ensure_cache_dir()
        
        # Cache statistics
        self.stats = {
            'hits': 0,
            'misses': 0,
            'saved_tokens': 0
        }

    def _ensure_cache_dir(self):
        """Create cache directory if it doesn't exist."""
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)

    def _generate_key(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Generate a unique cache key based on prompt and context."""
        # Combine prompt and context into a single string for hashing
        content = prompt
        if context:
            content += json.dumps(context, sort_keys=True)
        
        # Generate SHA-256 hash
        return hashlib.sha256(content.encode()).hexdigest()

    def _get_cache_path(self, key: str) -> str:
        """Get the file path for a cache key."""
        return os.path.join(self.cache_dir, f"{key}.json")

    def get(self, prompt: str, context: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached response for a prompt.
        
        Args:
            prompt: The prompt text
            context: Optional context dictionary
            
        Returns:
            Cached response or None if not found/expired
        """
        key = self._generate_key(prompt, context)
        cache_path = self._get_cache_path(key)
        
        if not os.path.exists(cache_path):
            self.stats['misses'] += 1
            return None
            
        try:
            with open(cache_path, 'r') as f:
                cached_data = json.load(f)
            
            # Check if cache has expired
            cached_time = datetime.fromisoformat(cached_data['timestamp'])
            if datetime.now() - cached_time > self.ttl:
                self.stats['misses'] += 1
                return None
            
            self.stats['hits'] += 1
            self.stats['saved_tokens'] += cached_data.get('token_count', 0)
            return cached_data['response']
            
        except (json.JSONDecodeError, KeyError, ValueError):
            self.stats['misses'] += 1
            return None

    def store(self, prompt: str, response: Dict[str, Any], 
             context: Optional[Dict] = None, token_count: int = 0):
        """
        Store a response in the cache.
        
        Args:
            prompt: The original prompt
            response: The response to cache
            context: Optional context dictionary
            token_count: Number of tokens in the response
        """
        key = self._generate_key(prompt, context)
        cache_path = self._get_cache_path(key)
        
        cache_data = {
            'timestamp': datetime.now().isoformat(),
            'prompt': prompt,
            'context': context,
            'response': response,
            'token_count': token_count
        }
        
        with open(cache_path, 'w') as f:
            json.dump(cache_data, f, indent=2)

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_requests = self.stats['hits'] + self.stats['misses']
        hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'total_requests': total_requests,
            'cache_hits': self.stats['hits'],
            'cache_misses': self.stats['misses'],
            'hit_rate_percent': hit_rate,
            'tokens_saved': self.stats['saved_tokens']
        }

    def clear_expired(self):
        """Remove expired cache entries."""
        current_time = datetime.now()
        cleared_count = 0
        
        for filename in os.listdir(self.cache_dir):
            if not filename.endswith('.json'):
                continue
                
            file_path = os.path.join(self.cache_dir, filename)
            try:
                with open(file_path, 'r') as f:
                    cached_data = json.load(f)
                
                cached_time = datetime.fromisoformat(cached_data['timestamp'])
                if current_time - cached_time > self.ttl:
                    os.remove(file_path)
                    cleared_count += 1
                    
            except (json.JSONDecodeError, KeyError, ValueError, OSError):
                # Remove corrupted cache files
                try:
                    os.remove(file_path)
                    cleared_count += 1
                except OSError:
                    pass
                    
        return cleared_count

# Example integration with rate limiting
class CachedOperation:
    """
    Combines prompt caching with rate limiting.
    """
    def __init__(self, cache_ttl_hours: int = 24):
        self.cache = PromptCache(ttl_hours=cache_ttl_hours)
        
        # Import RateLimiter here to avoid circular imports
        from rate_limiter import RateLimiter
        self.rate_limiter = RateLimiter()

    async def process_with_cache(self, 
                               prompt: str, 
                               context: Optional[Dict] = None,
                               force_refresh: bool = False) -> Dict[str, Any]:
        """
        Process a prompt with caching and rate limiting.
        
        Args:
            prompt: The prompt to process
            context: Optional context dictionary
            force_refresh: Force skip cache and get fresh response
            
        Returns:
            Response dictionary
        """
        if not force_refresh:
            cached_response = self.cache.get(prompt, context)
            if cached_response:
                return cached_response
        
        # Check rate limits before processing
        delays = self.rate_limiter.check_limits()
        max_delay = max(delays.values())
        if max_delay > 0:
            await asyncio.sleep(max_delay)
        
        # Process prompt (implement actual processing here)
        response = await self._process_prompt(prompt, context)
        
        # Store in cache
        self.cache.store(
            prompt=prompt,
            response=response,
            context=context,
            token_count=len(prompt.split()) + len(str(response).split())  # Simple approximation
        )
        
        # Record operation in rate limiter
        self.rate_limiter.record_operation()
        
        return response

    async def _process_prompt(self, prompt: str, context: Optional[Dict]) -> Dict[str, Any]:
        """
        Implement actual prompt processing here.
        This is where you'd integrate with your LLM or other processing logic.
        """
        # Placeholder for actual implementation
        return {"response": "Placeholder response"}

# Usage example
if __name__ == "__main__":
    # Example usage
    cache = PromptCache()
    
    # Store some test data
    cache.store(
        prompt="What is the safety protocol for X?",
        response={"answer": "Safety protocol details..."},
        context={"section": "safety_procedures"},
        token_count=150
    )
    
    # Retrieve cached data
    response = cache.get(
        prompt="What is the safety protocol for X?",
        context={"section": "safety_procedures"}
    )
    
    # Print cache statistics
    print("Cache Statistics:", cache.get_stats())