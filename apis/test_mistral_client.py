#!/usr/bin/env python3
"""
Unit tests for the Mistral AI client.

This module contains comprehensive tests for the MistralGitHubClient class,
including mock tests for API calls, error handling, and edge cases.

Usage:
    python -m pytest test_mistral_client.py -v
    or
    python test_mistral_client.py
"""

import unittest
from unittest.mock import Mock, patch, MagicMock, mock_open
import os
import sys
from io import StringIO
from typing import Any, Dict

# Add the directory to the path to import the module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Mock the mistralai module before importing our client
with patch.dict('sys.modules', {
    'mistralai': MagicMock(),
    'mistralai.client': MagicMock(),
    'mistralai.models.chat_completion': MagicMock()
}):
    import mistral_client
    from mistral_client import MistralGitHubClient, main


class TestMistralGitHubClient(unittest.TestCase):
    """Test cases for the MistralGitHubClient class."""
    
    def setUp(self) -> None:
        """Set up test fixtures before each test method."""
        self.valid_token = "ghp_1234567890abcdef1234567890abcdef12345678"
        self.invalid_token = "invalid_token"
        
    @patch.object(mistral_client, 'MISTRAL_AVAILABLE', True)
    @patch.object(mistral_client, 'MistralClient')
    def test_init_with_valid_token(self, mock_mistral_client: Mock) -> None:
        """Test initialization with a valid GitHub token."""
        mock_client_instance = Mock()
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient(self.valid_token)
        
        self.assertEqual(client.github_token, self.valid_token)
        self.assertTrue(client.is_connected)
        mock_mistral_client.assert_called_once_with(api_key=self.valid_token)
    
    @patch.object(mistral_client, 'MISTRAL_AVAILABLE', True)
    @patch.object(mistral_client, 'MistralClient')
    @patch.dict(os.environ, {'GITHUB_TOKEN': 'ghp_env_token123456789012345678901234567890'})
    def test_init_with_env_token(self, mock_mistral_client: Mock) -> None:
        """Test initialization with token from environment variable."""
        mock_client_instance = Mock()
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient()
        
        self.assertEqual(client.github_token, 'ghp_env_token123456789012345678901234567890')
        self.assertTrue(client.is_connected)
    
    @patch.object(mistral_client, 'MISTRAL_AVAILABLE', False)
    def test_init_without_mistral_library(self) -> None:
        """Test initialization when mistralai library is not available."""
        with self.assertRaises(ImportError) as context:
            MistralGitHubClient(self.valid_token)
        
        self.assertIn("mistralai library not found", str(context.exception))
    
    @patch.object(mistral_client, 'MISTRAL_AVAILABLE', True)
    def test_init_without_token(self) -> None:
        """Test initialization without providing a token."""
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(ValueError) as context:
                MistralGitHubClient()
            
            self.assertIn("GitHub token is required", str(context.exception))
    
    @patch.object(mistral_client, 'MISTRAL_AVAILABLE', True)
    def test_init_with_invalid_token_format(self) -> None:
        """Test initialization with invalid token format."""
        with self.assertRaises(ValueError) as context:
            MistralGitHubClient(self.invalid_token)
        
        self.assertIn("Invalid GitHub token format", str(context.exception))
    
    @patch.object(mistral_client, 'MISTRAL_AVAILABLE', True)
    @patch.object(mistral_client, 'MistralClient')
    def test_init_connection_error(self, mock_mistral_client: Mock) -> None:
        """Test initialization when MistralClient fails to initialize."""
        mock_mistral_client.side_effect = Exception("Connection failed")
        
        with self.assertRaises(ConnectionError) as context:
            MistralGitHubClient(self.valid_token)
        
        self.assertIn("Unable to initialize Mistral client", str(context.exception))
    
    def test_validate_token_format(self) -> None:
        """Test token format validation."""
        with patch.object(mistral_client, 'MISTRAL_AVAILABLE', True), \
             patch.object(mistral_client, 'MistralClient'):
            client = MistralGitHubClient(self.valid_token)
            
            # Valid tokens
            self.assertTrue(client._validate_token_format("ghp_1234567890abcdef"))
            self.assertTrue(client._validate_token_format("gho_1234567890abcdef"))
            self.assertTrue(client._validate_token_format("ghu_1234567890abcdef"))
            self.assertTrue(client._validate_token_format("ghs_1234567890abcdef"))
            
            # Invalid tokens
            self.assertFalse(client._validate_token_format("invalid_token"))
            self.assertFalse(client._validate_token_format("ghp_short"))
            self.assertFalse(client._validate_token_format(""))
            self.assertFalse(client._validate_token_format(None))
    
    def test_sanitize_message(self) -> None:
        """Test message sanitization."""
        with patch.object(mistral_client, 'MISTRAL_AVAILABLE', True), \
             patch.object(mistral_client, 'MistralClient'):
            client = MistralGitHubClient(self.valid_token)
            
            # Test token redaction
            message_with_token = "Here is my token: ghp_1234567890abcdef1234567890abcdef12345678"
            sanitized = client._sanitize_message(message_with_token)
            self.assertIn("[REDACTED_TOKEN]", sanitized)
            self.assertNotIn("ghp_", sanitized)
            
            # Test API key redaction
            message_with_key = "My API key is sk-1234567890abcdef1234567890abcdef1234567890abcdef"
            sanitized = client._sanitize_message(message_with_key)
            self.assertIn("[REDACTED_API_KEY]", sanitized)
            self.assertNotIn("sk-", sanitized)
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    def test_send_chat_message_success(self, mock_mistral_client: Mock) -> None:
        """Test successful chat message sending."""
        # Setup mock response
        mock_choice = Mock()
        mock_choice.message.content = "Test response from AI"
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        
        mock_client_instance = Mock()
        mock_client_instance.chat.return_value = mock_response
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient(self.valid_token)
        result = client.send_chat_message("Test message")
        
        self.assertTrue(result['success'])
        self.assertEqual(result['response'], "Test response from AI")
        self.assertEqual(result['model_used'], "mistral-tiny")
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    def test_send_chat_message_empty_message(self, mock_mistral_client: Mock) -> None:
        """Test sending empty message."""
        mock_client_instance = Mock()
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient(self.valid_token)
        
        with self.assertRaises(ValueError) as context:
            client.send_chat_message("")
        
        self.assertIn("Message cannot be empty", str(context.exception))
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    def test_send_chat_message_too_long(self, mock_mistral_client: Mock) -> None:
        """Test sending message that's too long."""
        mock_client_instance = Mock()
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient(self.valid_token)
        long_message = "x" * 10001  # Over the limit
        
        with self.assertRaises(ValueError) as context:
            client.send_chat_message(long_message)
        
        self.assertIn("Message too long", str(context.exception))
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    def test_send_chat_message_not_connected(self, mock_mistral_client: Mock) -> None:
        """Test sending message when not connected."""
        mock_client_instance = Mock()
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient(self.valid_token)
        client.is_connected = False  # Simulate disconnection
        
        with self.assertRaises(ConnectionError) as context:
            client.send_chat_message("Test message")
        
        self.assertIn("Not connected to Mistral AI", str(context.exception))
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    def test_send_chat_message_api_error(self, mock_mistral_client: Mock) -> None:
        """Test handling API errors during message sending."""
        mock_client_instance = Mock()
        mock_client_instance.chat.side_effect = Exception("API Error")
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient(self.valid_token)
        result = client.send_chat_message("Test message")
        
        self.assertFalse(result['success'])
        self.assertIn("API Error", result['error'])
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    def test_get_available_models(self, mock_mistral_client: Mock) -> None:
        """Test getting available models."""
        mock_client_instance = Mock()
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient(self.valid_token)
        models = client.get_available_models()
        
        self.assertIsInstance(models, list)
        self.assertIn("mistral-tiny", models)
        self.assertIn("mistral-small", models)
        self.assertIn("mistral-medium", models)
        self.assertIn("mistral-large", models)
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    def test_health_check_success(self, mock_mistral_client: Mock) -> None:
        """Test successful health check."""
        # Setup mock response
        mock_choice = Mock()
        mock_choice.message.content = "Hello response"
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        
        mock_client_instance = Mock()
        mock_client_instance.chat.return_value = mock_response
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient(self.valid_token)
        health_status = client.health_check()
        
        self.assertTrue(health_status)
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    def test_health_check_failure(self, mock_mistral_client: Mock) -> None:
        """Test health check failure."""
        mock_client_instance = Mock()
        mock_client_instance.chat.side_effect = Exception("Health check failed")
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient(self.valid_token)
        health_status = client.health_check()
        
        self.assertFalse(health_status)


class TestMainFunction(unittest.TestCase):
    """Test cases for the main function."""
    
    @patch.dict(os.environ, {}, clear=True)
    @patch('sys.stdout', new_callable=StringIO)
    def test_main_no_token(self, mock_stdout: StringIO) -> None:
        """Test main function when no GitHub token is set."""
        exit_code = main()
        
        self.assertEqual(exit_code, 1)
        output = mock_stdout.getvalue()
        self.assertIn("GITHUB_TOKEN environment variable not set", output)
        self.assertIn("Setup Instructions", output)
    
    @patch.dict(os.environ, {'GITHUB_TOKEN': 'ghp_1234567890abcdef1234567890abcdef12345678'})
    @patch('mistral_client.MISTRAL_AVAILABLE', False)
    @patch('sys.stdout', new_callable=StringIO)
    def test_main_missing_library(self, mock_stdout: StringIO) -> None:
        """Test main function when mistralai library is missing."""
        exit_code = main()
        
        self.assertEqual(exit_code, 1)
        output = mock_stdout.getvalue()
        self.assertIn("Import Error", output)
        self.assertIn("pip install mistralai", output)
    
    @patch.dict(os.environ, {'GITHUB_TOKEN': 'invalid_token'})
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('sys.stdout', new_callable=StringIO)
    def test_main_invalid_token(self, mock_stdout: StringIO) -> None:
        """Test main function with invalid token."""
        exit_code = main()
        
        self.assertEqual(exit_code, 1)
        output = mock_stdout.getvalue()
        self.assertIn("Configuration Error", output)
    
    @patch.dict(os.environ, {'GITHUB_TOKEN': 'ghp_1234567890abcdef1234567890abcdef12345678'})
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    @patch('builtins.input', side_effect=['n'])  # Simulate user saying no to interactive mode
    @patch('sys.stdout', new_callable=StringIO)
    def test_main_success_demo_only(self, mock_stdout: StringIO, mock_input: Mock, mock_mistral_client: Mock) -> None:
        """Test successful main function execution with demo only."""
        # Setup mock response
        mock_choice = Mock()
        mock_choice.message.content = "Test response"
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        
        mock_client_instance = Mock()
        mock_client_instance.chat.return_value = mock_response
        mock_mistral_client.return_value = mock_client_instance
        
        exit_code = main()
        
        self.assertEqual(exit_code, 0)
        output = mock_stdout.getvalue()
        self.assertIn("Successfully initialized Mistral AI client", output)
        self.assertIn("Demo completed successfully", output)


class TestInteractiveMethods(unittest.TestCase):
    """Test cases for interactive methods."""
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    @patch('sys.stdout', new_callable=StringIO)
    def test_demonstrate_interaction(self, mock_stdout: StringIO, mock_mistral_client: Mock) -> None:
        """Test demonstration interaction."""
        # Setup mock response
        mock_choice = Mock()
        mock_choice.message.content = "Demo response from AI"
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        
        mock_client_instance = Mock()
        mock_client_instance.chat.return_value = mock_response
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient("ghp_1234567890abcdef1234567890abcdef12345678")
        client.demonstrate_interaction()
        
        output = mock_stdout.getvalue()
        self.assertIn("Mistral AI GitHub Integration Demo", output)
        self.assertIn("Demo response from AI", output)
    
    @patch('mistral_client.MISTRAL_AVAILABLE', True)
    @patch('mistral_client.MistralClient')
    @patch('builtins.input', side_effect=['help', 'models', 'health', 'quit'])
    @patch('sys.stdout', new_callable=StringIO)
    def test_interactive_mode_commands(self, mock_stdout: StringIO, mock_input: Mock, mock_mistral_client: Mock) -> None:
        """Test interactive mode with various commands."""
        # Setup mock response for health check
        mock_choice = Mock()
        mock_choice.message.content = "Health check response"
        mock_response = Mock()
        mock_response.choices = [mock_choice]
        
        mock_client_instance = Mock()
        mock_client_instance.chat.return_value = mock_response
        mock_mistral_client.return_value = mock_client_instance
        
        client = MistralGitHubClient("ghp_1234567890abcdef1234567890abcdef12345678")
        client.interactive_mode()
        
        output = mock_stdout.getvalue()
        self.assertIn("Interactive Mode", output)
        self.assertIn("Available Commands", output)
        self.assertIn("Available Models", output)
        self.assertIn("Checking connection health", output)
        self.assertIn("Goodbye!", output)


if __name__ == '__main__':
    # Run tests with detailed output
    unittest.main(verbosity=2)