#!/usr/bin/env python3
"""
Mistral AI Client for GitHub API Integration

This script demonstrates how to interact with the Mistral AI model via the GitHub API.
It shows how to install the required library, authenticate using a personal access token,
and send chat messages to the model.

Prerequisites:
1. Install the required library:
   pip install mistralai

2. Set up your GitHub personal access token as an environment variable:
   export GITHUB_TOKEN="your_github_personal_access_token_here"
   
   You can create a personal access token at: https://github.com/settings/tokens
   Make sure to give it appropriate permissions for your use case.

Usage:
    python mistral_client.py
    
Author: Demo Repository
License: MIT
"""

import os
import sys
from typing import Optional, List, Dict, Any, Tuple
import logging

# Configure logging to avoid sensitive data exposure
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

try:
    from mistralai.client import MistralClient
    from mistralai.models.chat_completion import ChatMessage
    MISTRAL_AVAILABLE = True
except ImportError:
    MISTRAL_AVAILABLE = False
    logger.warning("mistralai library not found. Some functionality will be limited.")


class MistralGitHubClient:
    """
    A client for interacting with Mistral AI using GitHub authentication.
    
    This class provides a secure interface to the Mistral AI API using GitHub
    personal access tokens for authentication. It includes comprehensive error
    handling and logging while ensuring sensitive data is not exposed.
    
    Attributes:
        github_token (str): The GitHub personal access token (securely stored)
        client (MistralClient): The initialized Mistral AI client
        is_connected (bool): Whether the client is successfully connected
    """
    
    def __init__(self, github_token: Optional[str] = None) -> None:
        """
        Initialize the Mistral client with GitHub token authentication.
        
        Args:
            github_token: GitHub personal access token. If None, will try to get 
                         from GITHUB_TOKEN environment variable.
                         
        Raises:
            ValueError: If no GitHub token is provided or found in environment
            ImportError: If mistralai library is not installed
            ConnectionError: If unable to initialize the Mistral client
        """
        if not MISTRAL_AVAILABLE:
            raise ImportError(
                "mistralai library not found. Please install it using: pip install mistralai"
            )
            
        self.github_token = github_token or os.getenv('GITHUB_TOKEN')
        
        if not self.github_token:
            raise ValueError(
                "GitHub token is required. Set GITHUB_TOKEN environment variable or pass it directly."
            )
        
        if not self._validate_token_format(self.github_token):
            raise ValueError(
                "Invalid GitHub token format. Token should start with 'ghp_', 'gho_', 'ghu_', or 'ghs_'"
            )
        
        try:
            # Initialize Mistral client
            # Note: This example assumes Mistral AI supports GitHub token authentication
            # In practice, you might need to use Mistral's own API key system
            self.client = MistralClient(api_key=self.github_token)
            self.is_connected = True
            logger.info("Successfully initialized Mistral AI client")
        except Exception as e:
            self.is_connected = False
            logger.error("Failed to initialize Mistral client")
            raise ConnectionError(f"Unable to initialize Mistral client: {str(e)}") from e
    
    def _validate_token_format(self, token: str) -> bool:
        """
        Validate that the token follows GitHub's token format.
        
        Args:
            token: The token to validate
            
        Returns:
            bool: True if token format is valid, False otherwise
        """
        if not token or not isinstance(token, str):
            return False
        
        # GitHub tokens have specific prefixes
        valid_prefixes = ['ghp_', 'gho_', 'ghu_', 'ghs_']
        return any(token.startswith(prefix) for prefix in valid_prefixes) and len(token) > 10
    
    def _sanitize_message(self, message: str) -> str:
        """
        Sanitize message content to remove potential sensitive information.
        
        Args:
            message: The message to sanitize
            
        Returns:
            str: The sanitized message
        """
        # Remove potential tokens or sensitive patterns
        import re
        sanitized = re.sub(r'gh[a-z]_[A-Za-z0-9_]{36,}', '[REDACTED_TOKEN]', message)
        sanitized = re.sub(r'sk-[A-Za-z0-9]{48,}', '[REDACTED_API_KEY]', sanitized)
        return sanitized
        
    def send_chat_message(self, message: str, model: str = "mistral-tiny") -> Dict[str, Any]:
        """
        Send a chat message to the Mistral AI model.
        
        Args:
            message: The message to send to the AI model
            model: The Mistral model to use (default: "mistral-tiny")
            
        Returns:
            Dict containing 'success', 'response', and optionally 'error' keys
            
        Raises:
            ValueError: If message is empty or invalid
            ConnectionError: If not connected to Mistral AI
        """
        if not self.is_connected:
            raise ConnectionError("Not connected to Mistral AI. Please reinitialize the client.")
        
        if not message or not message.strip():
            raise ValueError("Message cannot be empty")
        
        if len(message.strip()) > 10000:  # Reasonable message length limit
            raise ValueError("Message too long. Please limit to 10,000 characters.")
        
        # Sanitize message for logging
        sanitized_message = self._sanitize_message(message)
        logger.info(f"Sending message to model '{model}': {sanitized_message[:100]}...")
        
        try:
            # Create the chat message
            messages = [
                ChatMessage(role="user", content=message.strip())
            ]
            
            # Send the message to Mistral AI
            chat_response = self.client.chat(
                model=model,
                messages=messages,
            )
            
            # Extract and return the response
            response_content = chat_response.choices[0].message.content
            logger.info("Successfully received response from Mistral AI")
            
            return {
                'success': True,
                'response': response_content,
                'model_used': model
            }
            
        except Exception as e:
            error_msg = f"Error communicating with Mistral AI: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg,
                'model_used': model
            }
    
    def get_available_models(self) -> List[str]:
        """
        Get a list of available Mistral models.
        
        Returns:
            List of available model names
        """
        # Default models - in practice, this could query the API for available models
        return [
            "mistral-tiny",
            "mistral-small", 
            "mistral-medium",
            "mistral-large"
        ]
    
    def health_check(self) -> bool:
        """
        Perform a health check to verify the connection is working.
        
        Returns:
            bool: True if connection is healthy, False otherwise
        """
        try:
            result = self.send_chat_message("Hello")
            return result['success']
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
    
    def demonstrate_interaction(self) -> None:
        """
        Demonstrate basic interaction with the Mistral AI model.
        
        This method runs through several example messages to showcase
        the client's functionality and provide sample outputs.
        """
        print("🤖 Mistral AI GitHub Integration Demo")
        print("=" * 40)
        
        # Example messages to demonstrate the functionality
        demo_messages = [
            "Hello, can you help me with a simple coding question?",
            "What are the best practices for writing secure smart contracts?",
            "Explain the difference between ERC-20 and ERC-721 tokens."
        ]
        
        for i, message in enumerate(demo_messages, 1):
            print(f"\n📝 Demo Message {i}: {message}")
            print("🔄 Sending to Mistral AI...")
            
            try:
                result = self.send_chat_message(message)
                if result['success']:
                    response = result['response']
                    display_response = (
                        f"{response[:200]}..." if len(response) > 200 else response
                    )
                    print(f"✅ Response: {display_response}")
                else:
                    print(f"❌ Error: {result['error']}")
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
    
    def interactive_mode(self) -> None:
        """
        Start an interactive chat session with Mistral AI.
        
        This method provides a command-line interface for real-time
        interaction with the Mistral AI model. Users can type messages
        and receive responses until they choose to exit.
        """
        print("\n🚀 Interactive Mode - Type 'quit' or 'exit' to end the session")
        print("Commands: 'help', 'models', 'health', 'quit'")
        print("=" * 60)
        
        while True:
            try:
                user_input = input("\n💬 You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("👋 Goodbye!")
                    break
                elif user_input.lower() == 'help':
                    self._show_help()
                    continue
                elif user_input.lower() == 'models':
                    self._show_models()
                    continue
                elif user_input.lower() == 'health':
                    self._show_health_status()
                    continue
                
                if not user_input:
                    print("Please enter a message or command.")
                    continue
                
                print("🔄 Mistral AI is thinking...")
                result = self.send_chat_message(user_input)
                
                if result['success']:
                    print(f"🤖 Mistral AI: {result['response']}")
                else:
                    print(f"❌ Error: {result['error']}")
                
            except KeyboardInterrupt:
                print("\n\n👋 Session ended by user. Goodbye!")
                break
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
    
    def _show_help(self) -> None:
        """Display help information for interactive mode."""
        print("\n📋 Available Commands:")
        print("  help    - Show this help message")
        print("  models  - List available models")
        print("  health  - Check connection health")
        print("  quit    - Exit interactive mode")
        print("\nJust type any message to chat with Mistral AI!")
    
    def _show_models(self) -> None:
        """Display available models."""
        print("\n🎯 Available Models:")
        for model in self.get_available_models():
            print(f"  • {model}")
    
    def _show_health_status(self) -> None:
        """Display connection health status."""
        print("\n🏥 Checking connection health...")
        if self.health_check():
            print("✅ Connection is healthy!")
        else:
            print("❌ Connection issues detected. Please check your token and network.")


def main() -> int:
    """
    Main function to run the Mistral AI client demonstration.
    
    Returns:
        int: Exit code (0 for success, 1 for error)
    """
    print("🔧 Mistral AI Client - GitHub Integration")
    print("========================================")
    
    # Check if GitHub token is available
    github_token = os.getenv('GITHUB_TOKEN')
    if not github_token:
        print("❌ Error: GITHUB_TOKEN environment variable not set.")
        print("\n📋 Setup Instructions:")
        print("1. Go to https://github.com/settings/tokens")
        print("2. Create a new personal access token")
        print("3. Export it as an environment variable:")
        print("   export GITHUB_TOKEN='your_token_here'")
        print("4. Run this script again")
        print("\n🔒 Security Note: Never commit your token to version control!")
        return 1
    
    try:
        # Initialize the client
        client = MistralGitHubClient()
        print("✅ Successfully initialized Mistral AI client with GitHub authentication")
        
        # Perform health check
        print("\n🏥 Performing health check...")
        if not client.health_check():
            print("⚠️  Warning: Health check failed. Continuing with demo anyway.")
        else:
            print("✅ Health check passed!")
        
        # Run demonstration
        print("\n🎯 Running demonstration...")
        client.demonstrate_interaction()
        
        # Ask if user wants interactive mode
        while True:
            try:
                choice = input("\n❓ Would you like to start interactive mode? (y/n): ").strip().lower()
                if choice in ['y', 'yes']:
                    client.interactive_mode()
                    break
                elif choice in ['n', 'no']:
                    print("✅ Demo completed successfully!")
                    break
                else:
                    print("Please enter 'y' or 'n'")
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
        
        return 0
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("\n📦 Please install required dependencies:")
        print("   pip install mistralai")
        return 1
    except ValueError as e:
        print(f"❌ Configuration Error: {e}")
        return 1
    except ConnectionError as e:
        print(f"❌ Connection Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your internet connection")
        print("2. Verify your GitHub token is valid")
        print("3. Ensure the Mistral AI service is accessible")
        return 1
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        print(f"❌ Unexpected Error: {e}")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)