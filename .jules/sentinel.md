## 2025-12-22 - SSRF Protection for CORS Proxy
**Vulnerability:** The application uses a public CORS proxy (`api.allorigins.win`) to fetch `robots.txt` for policy checking. This created an SSRF risk where internal network URLs (localhost, private IPs) could be leaked to the proxy service.
**Learning:** Even client-side or "safe" proxies can be vectors for information leakage if they forward internal addresses.
**Prevention:** Implement strict URL validation (SSRF Protection) to block local and private IP ranges before sending requests to external proxies.

## 2025-10-27 - Prompt Injection & DoS Protection
**Vulnerability:** The AI service allowed unlimited string inputs and interpolated user inputs directly into system prompts.
**Learning:** Even internal AI services are vulnerable to Prompt Injection if user input is treated as system instructions. Also, unlimited input size is a trivial DoS vector for token-based APIs.
**Prevention:**
1. Enforce strict input length limits ().
2. Never interpolate user input into . Pass it as the user  message.


## 2025-10-27 - Prompt Injection & DoS Protection
**Vulnerability:** The AI service allowed unlimited string inputs and interpolated user inputs directly into system prompts.
**Learning:** Even internal AI services are vulnerable to Prompt Injection if user input is treated as system instructions. Also, unlimited input size is a trivial DoS vector for token-based APIs.
**Prevention:**
1. Enforce strict input length limits (`MAX_INPUT_LENGTH = 500`).
2. Never interpolate user input into `systemInstruction`. Pass it as the user `contents` message.
