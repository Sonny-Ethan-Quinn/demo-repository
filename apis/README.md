# APIs Directory

This directory contains API integrations and client scripts for external services.

## Mistral AI Integration

### `mistral_client.py`

A comprehensive Python client for interacting with the Mistral AI model via GitHub API authentication. This script demonstrates secure API integration with proper error handling, logging, and user interaction.

#### ✨ Features

- **Demo Mode**: Automatically sends example messages to demonstrate functionality
- **Interactive Mode**: Real-time chat interface with the Mistral AI model
- **Comprehensive Error Handling**: Proper error messages for missing dependencies, authentication issues, and network failures
- **Security-First Design**: Secure token management with sanitization and validation
- **Type Hints**: Full type annotation support for better code maintainability
- **Logging**: Structured logging without exposing sensitive information
- **Health Checks**: Built-in connection validation
- **Command Support**: Interactive commands for help, model listing, and health status

#### 📋 Setup Instructions

1. **Install Python Dependencies:**
   ```bash
   pip install mistralai
   ```
   
   **Note**: If you encounter installation issues, try:
   ```bash
   pip install --upgrade pip
   pip install mistralai --no-cache-dir
   ```

2. **Set up GitHub Personal Access Token:**
   
   a. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
   
   b. Click "Generate new token (classic)"
   
   c. Give it a descriptive name (e.g., "Mistral AI Integration")
   
   d. Select appropriate scopes (minimum required for your use case)
   
   e. Copy the generated token
   
   f. Set it as an environment variable:
   ```bash
   export GITHUB_TOKEN="your_github_personal_access_token_here"
   ```
   
   **For persistent setup, add to your shell profile:**
   ```bash
   echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Run the Script:**
   ```bash
   python3 apis/mistral_client.py
   ```

#### 🚀 Usage Examples

##### Basic Usage
```python
from apis.mistral_client import MistralGitHubClient

# Initialize with environment variable
client = MistralGitHubClient()

# Send a message
result = client.send_chat_message("Hello, Mistral AI!")
if result['success']:
    print(f"Response: {result['response']}")
else:
    print(f"Error: {result['error']}")
```

##### Advanced Usage
```python
# Initialize with explicit token
client = MistralGitHubClient("ghp_your_token_here")

# Check available models
models = client.get_available_models()
print(f"Available models: {models}")

# Perform health check
if client.health_check():
    print("Connection is healthy!")

# Send message with specific model
result = client.send_chat_message(
    "Explain blockchain technology",
    model="mistral-small"
)
```

#### 📱 Interactive Mode Commands

When running in interactive mode, the following commands are available:

- `help` - Display available commands
- `models` - List available Mistral AI models
- `health` - Check connection health status
- `quit` or `exit` - Exit interactive mode

#### 📤 Example Outputs

##### Demo Mode Output
```
🔧 Mistral AI Client - GitHub Integration
========================================
✅ Successfully initialized Mistral AI client with GitHub authentication

🏥 Performing health check...
✅ Health check passed!

🎯 Running demonstration...
🤖 Mistral AI GitHub Integration Demo
========================================

📝 Demo Message 1: Hello, can you help me with a simple coding question?
🔄 Sending to Mistral AI...
✅ Response: Of course! I'd be happy to help you with coding questions. Whether you're working with Python, JavaScript, Solidity for smart contracts, or any other programming language...

📝 Demo Message 2: What are the best practices for writing secure smart contracts?
🔄 Sending to Mistral AI...
✅ Response: Here are the key best practices for writing secure smart contracts: 1. Use established patterns and libraries like OpenZeppelin, 2. Implement proper access controls...

❓ Would you like to start interactive mode? (y/n): n
✅ Demo completed successfully!
```

##### Interactive Mode Output
```
🚀 Interactive Mode - Type 'quit' or 'exit' to end the session
Commands: 'help', 'models', 'health', 'quit'
============================================================

💬 You: help

📋 Available Commands:
  help    - Show this help message
  models  - List available models
  health  - Check connection health
  quit    - Exit interactive mode

Just type any message to chat with Mistral AI!

💬 You: models

🎯 Available Models:
  • mistral-tiny
  • mistral-small
  • mistral-medium
  • mistral-large

💬 You: What is the difference between ERC-20 and ERC-721?
🔄 Mistral AI is thinking...
🤖 Mistral AI: ERC-20 and ERC-721 are both Ethereum token standards, but they serve different purposes...

💬 You: quit
👋 Goodbye!
```

#### 🛠️ Troubleshooting

##### Common Issues and Solutions

**1. ImportError: No module named 'mistralai'**
```bash
# Solution: Install the required library
pip install mistralai

# If that fails, try:
pip install --upgrade pip
pip install mistralai --no-cache-dir

# For Python 3 specifically:
python3 -m pip install mistralai
```

**2. ValueError: GitHub token is required**
```bash
# Solution: Set the environment variable
export GITHUB_TOKEN="your_token_here"

# Verify it's set:
echo $GITHUB_TOKEN

# Make it persistent:
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc
```

**3. ValueError: Invalid GitHub token format**
- Ensure your token starts with one of: `ghp_`, `gho_`, `ghu_`, or `ghs_`
- Check that the token is complete and not truncated
- Generate a new token if the current one is malformed

**4. ConnectionError: Unable to initialize Mistral client**
- Check your internet connection
- Verify the token has appropriate permissions
- Ensure Mistral AI services are accessible from your network
- Try the health check command to diagnose issues

**5. API Errors during message sending**
- Check your token's rate limits
- Verify the selected model is available
- Ensure your message isn't too long (10,000 character limit)
- Check Mistral AI service status

**6. Permission denied or access issues**
```bash
# Make sure the script is executable
chmod +x apis/mistral_client.py

# Run with explicit Python interpreter
python3 apis/mistral_client.py
```

#### 🔒 Security Best Practices

##### Token Management
- **Never commit tokens to version control**: Add `.env` files to `.gitignore`
- **Use environment variables**: Store tokens in `GITHUB_TOKEN` environment variable
- **Rotate tokens regularly**: Generate new tokens periodically
- **Limit token scope**: Only grant necessary permissions
- **Monitor token usage**: Check GitHub settings for token activity

##### Secure Coding Practices
- **Input sanitization**: All user inputs are sanitized before logging
- **No sensitive data logging**: Tokens and API keys are automatically redacted
- **Error handling**: Graceful failure without exposing internal details
- **Type safety**: Full type hints for better code reliability

##### Network Security
- **HTTPS only**: All communications use encrypted connections
- **Timeout handling**: Prevents hanging connections
- **Rate limiting**: Respect API rate limits to avoid blocking

#### 🧪 Testing

The client includes comprehensive unit tests with mock API calls:

```bash
# Run tests with unittest
python3 apis/test_mistral_client.py

# Run with pytest (if installed)
pip install pytest
python -m pytest apis/test_mistral_client.py -v

# Run specific test class
python -m pytest apis/test_mistral_client.py::TestMistralGitHubClient -v
```

#### 📊 Test Coverage

The test suite covers:
- ✅ Client initialization with various token scenarios
- ✅ Message sending with success and error cases
- ✅ Token validation and format checking
- ✅ Message sanitization for security
- ✅ Health checks and connection validation
- ✅ Interactive mode commands
- ✅ Error handling for all edge cases
- ✅ Main function execution paths

#### 📋 Requirements

- **Python**: 3.6+ (tested on 3.12.3)
- **Dependencies**: `mistralai` library
- **Authentication**: Valid GitHub personal access token
- **Network**: Internet connection for API calls

#### 🔧 Development

For development and testing:

```bash
# Install development dependencies
pip install pytest pytest-cov

# Run tests with coverage
python -m pytest apis/test_mistral_client.py --cov=apis.mistral_client --cov-report=html

# Check code style (if flake8 is installed)
pip install flake8
flake8 apis/mistral_client.py --max-line-length=100

# Type checking (if mypy is installed)
pip install mypy
mypy apis/mistral_client.py
```

#### 📚 API Reference

##### Class: `MistralGitHubClient`

###### Methods:

- `__init__(github_token: Optional[str] = None) -> None`
  - Initialize client with GitHub token
  - Raises: `ValueError`, `ImportError`, `ConnectionError`

- `send_chat_message(message: str, model: str = "mistral-tiny") -> Dict[str, Any]`
  - Send message to Mistral AI
  - Returns: Dict with 'success', 'response', 'error', 'model_used' keys
  - Raises: `ValueError`, `ConnectionError`

- `get_available_models() -> List[str]`
  - Get list of available Mistral models
  - Returns: List of model names

- `health_check() -> bool`
  - Check connection health
  - Returns: True if healthy, False otherwise

- `demonstrate_interaction() -> None`
  - Run demonstration with example messages

- `interactive_mode() -> None`
  - Start interactive chat session

#### 🤝 Contributing

To contribute to this client:

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Include comprehensive docstrings
4. Write unit tests for new features
5. Ensure security best practices
6. Update documentation for changes

#### ⚠️ Security Notice

- Keep your GitHub token secure and never share it
- Monitor your token usage in GitHub settings
- Report any security vulnerabilities responsibly
- Use this client only with trusted networks and systems