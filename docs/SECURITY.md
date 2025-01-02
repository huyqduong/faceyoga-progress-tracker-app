# Security Configuration

This document outlines the security measures implemented in the Face Yoga Progress Tracker application.

## Security Headers

The application implements various security headers both in development and production environments to protect against common web vulnerabilities.

### Implemented Headers

1. **Content Security Policy (CSP)**
   - Controls which resources can be loaded
   - Prevents XSS attacks
   - Configuration:
   ```
   default-src 'self';
   script-src 'self' 'unsafe-inline' 'unsafe-eval';
   style-src 'self' 'unsafe-inline';
   img-src 'self' data: blob: https://*;
   font-src 'self' data:;
   connect-src 'self' https://*.supabase.co wss://*.supabase.co;
   frame-ancestors 'none';
   base-uri 'self';
   form-action 'self'
   ```

2. **X-Frame-Options**
   - Set to `DENY`
   - Prevents clickjacking attacks by disabling iframe embedding

3. **X-Content-Type-Options**
   - Set to `nosniff`
   - Prevents MIME type sniffing

4. **Referrer-Policy**
   - Set to `strict-origin-when-cross-origin`
   - Controls how much referrer information is shared

5. **Permissions-Policy**
   - Restricts access to browser features
   - Currently disabled: accelerometer, camera, geolocation, gyroscope, magnetometer, microphone, payment, usb

### Implementation

1. **Development Environment** (`vite.config.ts`):
   ```typescript
   server: {
     headers: {
       'Content-Security-Policy': "default-src 'self'; ...",
       'X-Frame-Options': 'DENY',
       'X-Content-Type-Options': 'nosniff',
       'Referrer-Policy': 'strict-origin-when-cross-origin',
       'Permissions-Policy': "accelerometer=(), ..."
     }
   }
   ```

2. **Production Environment** (`public/_headers`):
   ```
   /*
     Content-Security-Policy: default-src 'self'; ...
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     Permissions-Policy: accelerometer=(), ...
   ```

## Testing Security Headers

A test script is provided to verify security headers in both development and production environments:

1. Location: `scripts/test-security-headers.js`
2. Usage:
   ```bash
   node scripts/test-security-headers.js
   ```
3. The script tests both:
   - Development environment (http://localhost:5173)
   - Production environment (https://app.renewglowfaceyoga.com)

## Modifying Security Headers

When adding new features that require external resources:

1. Update CSP in both:
   - `vite.config.ts` for development
   - `public/_headers` for production
2. Test changes using the security headers test script
3. Common modifications needed:
   - Adding new domains to `connect-src` for API endpoints
   - Adding new domains to `img-src` for external images
   - Adding new domains to `script-src` for external scripts

## Additional Security Resources

- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [SecurityHeaders.com](https://securityheaders.com) - Online security header checker
