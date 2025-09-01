# APIs Directory

This directory contains API integrations and client scripts for external services.

## Mistral AI Integration

### `mistral_client.py`

A Python client for interacting with the Mistral AI model via the GitHub API. This script demonstrates how to:

- Install the required `mistralai` library
- Authenticate using a GitHub personal access token
- Send chat messages to the Mistral AI model
- Handle errors and provide user-friendly feedback

#### Setup Instructions

1. **Install the required library:**
   ```bash
   pip install mistralai
   ```

2. **Set up your GitHub personal access token:**
   ```bash
   export GITHUB_TOKEN="your_github_personal_access_token_here"
   ```
   
   You can create a personal access token at: https://github.com/settings/tokens

3. **Run the script:**
   ```bash
   python3 apis/mistral_client.py
   ```

#### Features

- **Demo Mode**: Automatically sends example messages to demonstrate functionality
- **Interactive Mode**: Allows real-time chat with the Mistral AI model
- **Error Handling**: Proper error messages for missing dependencies or authentication
- **Environment Variable Support**: Secure token management through environment variables

#### Requirements

- Python 3.6+
- `mistralai` Python library
- Valid GitHub personal access token

#### Usage Examples

```python
from apis.mistral_client import MistralGitHubClient

# Initialize with environment variable
client = MistralGitHubClient()

# Send a message
response = client.send_chat_message("Hello, Mistral AI!")
print(response)
```

#### Security Notes

- Never commit your GitHub token to version control
- Use environment variables for sensitive information
- Ensure your GitHub token has appropriate permissions
- The token should be kept secure and rotated regularly