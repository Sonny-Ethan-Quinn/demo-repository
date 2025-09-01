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
from typing import Optional

try:
    from mistralai.client import MistralClient
    from mistralai.models.chat_completion import ChatMessage
except ImportError:
    print("Error: mistralai library not found.")
    print("Please install it using: pip install mistralai")
    sys.exit(1)


class MistralGitHubClient:
    """
    A client for interacting with Mistral AI using GitHub authentication.
    """
    
    def __init__(self, github_token: Optional[str] = None):
        """
        Initialize the Mistral client with GitHub token authentication.
        
        Args:
            github_token: GitHub personal access token. If None, will try to get from environment.
        """
        self.github_token = github_token or os.getenv('GITHUB_TOKEN')
        
        if not self.github_token:
            raise ValueError(
                "GitHub token is required. Set GITHUB_TOKEN environment variable or pass it directly."
            )
        
        # Initialize Mistral client
        # Note: This example assumes Mistral AI supports GitHub token authentication
        # In practice, you might need to use Mistral's own API key system
        self.client = MistralClient(api_key=self.github_token)
        
    def send_chat_message(self, message: str, model: str = "mistral-tiny") -> str:
        """
        Send a chat message to the Mistral AI model.
        
        Args:
            message: The message to send to the AI model
            model: The Mistral model to use (default: "mistral-tiny")
            
        Returns:
            The AI model's response as a string
        """
        try:
            # Create the chat message
            messages = [
                ChatMessage(role="user", content=message)
            ]
            
            # Send the message to Mistral AI
            chat_response = self.client.chat(
                model=model,
                messages=messages,
            )
            
            # Extract and return the response
            return chat_response.choices[0].message.content
            
        except Exception as e:
            return f"Error communicating with Mistral AI: {str(e)}"
    
    def demonstrate_interaction(self):
        """
        Demonstrate basic interaction with the Mistral AI model.
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
            
            response = self.send_chat_message(message)
            print(f"✅ Response: {response[:200]}..." if len(response) > 200 else f"✅ Response: {response}")
    
    def interactive_mode(self):
        """
        Start an interactive chat session with Mistral AI.
        """
        print("\n🚀 Interactive Mode - Type 'quit' or 'exit' to end the session")
        print("=" * 60)
        
        while True:
            try:
                user_input = input("\n💬 You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("👋 Goodbye!")
                    break
                
                if not user_input:
                    continue
                
                print("🔄 Mistral AI is thinking...")
                response = self.send_chat_message(user_input)
                print(f"🤖 Mistral AI: {response}")
                
            except KeyboardInterrupt:
                print("\n\n👋 Session ended by user. Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")


def main():
    """
    Main function to run the Mistral AI client demonstration.
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
        return 1
    
    try:
        # Initialize the client
        client = MistralGitHubClient()
        print("✅ Successfully initialized Mistral AI client with GitHub authentication")
        
        # Run demonstration
        print("\n🎯 Running demonstration...")
        client.demonstrate_interaction()
        
        # Ask if user wants interactive mode
        while True:
            choice = input("\n❓ Would you like to start interactive mode? (y/n): ").strip().lower()
            if choice in ['y', 'yes']:
                client.interactive_mode()
                break
            elif choice in ['n', 'no']:
                print("✅ Demo completed successfully!")
                break
            else:
                print("Please enter 'y' or 'n'")
        
        return 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)