## 2025-12-22 - SSRF Protection for CORS Proxy
**Vulnerability:** The application uses a public CORS proxy (`api.allorigins.win`) to fetch `robots.txt` for policy checking. This created an SSRF risk where internal network URLs (localhost, private IPs) could be leaked to the proxy service.
**Learning:** Even client-side or "safe" proxies can be vectors for information leakage if they forward internal addresses.
**Prevention:** Implement strict URL validation (SSRF Protection) to block local and private IP ranges before sending requests to external proxies.
