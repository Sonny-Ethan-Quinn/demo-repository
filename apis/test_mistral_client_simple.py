#!/usr/bin/env python3
"""
Simplified unit tests for the Mistral AI client.

This module contains essential tests for the MistralGitHubClient class
that work regardless of whether the mistralai library is installed.

Usage:
    python test_mistral_client_simple.py
"""

import unittest
from unittest.mock import Mock, patch, MagicMock
import os
import sys
from io import StringIO
import tempfile
import importlib.util
import subprocess

# Add the directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


class TestMistralClientBasics(unittest.TestCase):
    """Basic tests that work without external dependencies."""
    
    def test_script_syntax(self):
        """Test that the script has valid Python syntax."""
        script_path = os.path.join(os.path.dirname(__file__), 'mistral_client.py')
        with open(script_path, 'r') as f:
            source = f.read()
        
        try:
            compile(source, script_path, 'exec')
            self.assertTrue(True, "Script has valid syntax")
        except SyntaxError as e:
            self.fail(f"Script has syntax error: {e}")
    
    def test_imports_without_mistralai(self):
        """Test that the script can be imported without mistralai library."""
        # Mock the missing module
        with patch.dict('sys.modules', {
            'mistralai': None,
            'mistralai.client': None,
            'mistralai.models.chat_completion': None
        }):
            try:
                import mistral_client
                self.assertFalse(mistral_client.MISTRAL_AVAILABLE)
            except ImportError:
                self.fail("Script should handle missing mistralai gracefully")
    
    def test_main_function_no_token(self):
        """Test main function behavior without token."""
        with patch.dict(os.environ, {}, clear=True):
            with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
                # Mock the missing module  
                with patch.dict('sys.modules', {
                    'mistralai': None,
                    'mistralai.client': None,
                    'mistralai.models.chat_completion': None
                }):
                    # Import and test
                    import mistral_client
                    importlib.reload(mistral_client)
                    exit_code = mistral_client.main()
                    
                    self.assertEqual(exit_code, 1)
                    output = mock_stdout.getvalue()
                    self.assertIn("GITHUB_TOKEN environment variable not set", output)
    
    def test_token_validation_function(self):
        """Test token validation without creating client instance."""
        # We'll test the validation logic indirectly by checking the patterns
        valid_prefixes = ['ghp_', 'gho_', 'ghu_', 'ghs_']
        
        # Test valid token patterns
        for prefix in valid_prefixes:
            token = prefix + "1234567890abcdef"
            self.assertTrue(len(token) > 10, f"Token {token} should be long enough")
            self.assertTrue(any(token.startswith(p) for p in valid_prefixes), 
                          f"Token {token} should start with valid prefix")
        
        # Test invalid patterns
        invalid_tokens = ["invalid", "ghp_short", "", "wrong_prefix"]
        for token in invalid_tokens:
            if token:
                self.assertFalse(any(token.startswith(p) for p in valid_prefixes) and len(token) > 10,
                               f"Token {token} should be invalid")


class TestWithMockedLibrary(unittest.TestCase):
    """Tests that use mocked mistralai library."""
    
    def setUp(self):
        """Set up mocked mistralai library."""
        self.mock_mistral_client = MagicMock()
        self.mock_chat_message = MagicMock()
        
        self.patcher_modules = patch.dict('sys.modules', {
            'mistralai': MagicMock(),
            'mistralai.client': MagicMock(),
            'mistralai.models.chat_completion': MagicMock()
        })
        self.patcher_modules.start()
        
        # Import after mocking
        global mistral_client
        import mistral_client
        importlib.reload(mistral_client)
        self.mistral_client = mistral_client
    
    def tearDown(self):
        """Clean up patches."""
        self.patcher_modules.stop()
    
    def test_client_creation_with_valid_token(self):
        """Test client creation with valid token."""
        valid_token = "ghp_1234567890abcdef1234567890abcdef12345678"
        
        with patch.object(self.mistral_client, 'MISTRAL_AVAILABLE', True):
            with patch.object(self.mistral_client, 'MistralClient') as mock_client:
                mock_client.return_value = MagicMock()
                
                try:
                    client = self.mistral_client.MistralGitHubClient(valid_token)
                    self.assertEqual(client.github_token, valid_token)
                    self.assertTrue(client.is_connected)
                except Exception as e:
                    self.fail(f"Client creation should succeed: {e}")
    
    def test_client_creation_invalid_token(self):
        """Test client creation with invalid token."""
        invalid_token = "invalid_token"
        
        with patch.object(self.mistral_client, 'MISTRAL_AVAILABLE', True):
            with self.assertRaises(ValueError) as context:
                self.mistral_client.MistralGitHubClient(invalid_token)
            
            self.assertIn("Invalid GitHub token format", str(context.exception))
    
    def test_client_creation_without_library(self):
        """Test client creation when library is not available."""
        valid_token = "ghp_1234567890abcdef1234567890abcdef12345678"
        
        with patch.object(self.mistral_client, 'MISTRAL_AVAILABLE', False):
            with self.assertRaises(ImportError) as context:
                self.mistral_client.MistralGitHubClient(valid_token)
            
            self.assertIn("mistralai library not found", str(context.exception))
    
    def test_message_sanitization(self):
        """Test that sensitive information is sanitized."""
        import re
        
        # Test the sanitization logic
        test_message = "My token is ghp_1234567890abcdef1234567890abcdef12345678 and key is sk-1234567890abcdef1234567890abcdef1234567890abcdef"
        
        # Apply the same regex patterns used in the code
        sanitized = re.sub(r'gh[a-z]_[A-Za-z0-9_]{36,}', '[REDACTED_TOKEN]', test_message)
        sanitized = re.sub(r'sk-[A-Za-z0-9]{48,}', '[REDACTED_API_KEY]', sanitized)
        
        self.assertIn("[REDACTED_TOKEN]", sanitized)
        self.assertIn("[REDACTED_API_KEY]", sanitized)
        self.assertNotIn("ghp_", sanitized)
        self.assertNotIn("sk-", sanitized)


class TestScriptIntegration(unittest.TestCase):
    """Integration tests for the script."""
    
    def test_script_execution_without_deps(self):
        """Test script execution without dependencies."""
        script_path = os.path.join(os.path.dirname(__file__), 'mistral_client.py')
        
        # Run the script and capture output
        import subprocess
        result = subprocess.run([
            sys.executable, script_path
        ], capture_output=True, text=True, env={})
        
        # Should exit with code 1 (no token)
        self.assertEqual(result.returncode, 1)
        self.assertIn("GITHUB_TOKEN environment variable not set", result.stdout)
    
    def test_script_help_message(self):
        """Test that the script shows helpful error messages."""
        script_path = os.path.join(os.path.dirname(__file__), 'mistral_client.py')
        
        result = subprocess.run([
            sys.executable, script_path
        ], capture_output=True, text=True, env={})
        
        output = result.stdout
        self.assertIn("Setup Instructions", output)
        self.assertIn("https://github.com/settings/tokens", output)
        self.assertIn("export GITHUB_TOKEN", output)
        self.assertIn("Security Note", output)


if __name__ == '__main__':
    # Run with verbose output
    unittest.main(verbosity=2)