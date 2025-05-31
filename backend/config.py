import sys
import logging
import os

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)-8s %(name)-10s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    stream=sys.stdout
)

# Create logger instance
logger = logging.getLogger()

# Keychain secrets configuration
# Format: (service_name, account_name, env_var_name)
# If env_var_name is None, account_name will be used
KEYCHAIN_SECRETS = [
    ("global", "OPENROUTER_API_KEY", None),
]


def load_keychain_secrets():
    """Load secrets from keychain if enabled"""
    if os.getenv("LOAD_KEYCHAIN_SECRETS", "0") == "1":
        try:
            from keychain import load_secrets
            if load_secrets(KEYCHAIN_SECRETS):
                logger.info("Successfully loaded secrets from keychain")
            else:
                logger.warning("Failed to load some secrets from keychain")
        except Exception as e:
            logger.error(f"Error loading secrets from keychain: {e}")

# Load secrets before environment variables
load_keychain_secrets()