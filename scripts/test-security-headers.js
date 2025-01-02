import https from 'https';
import http from 'http';

// Function to test security headers
async function testSecurityHeaders(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      console.log('\nTesting Security Headers for:', url);
      console.log('Status:', res.statusCode);
      console.log('\nSecurity Headers:');
      
      // List of security headers we're looking for
      const securityHeaders = [
        'content-security-policy',
        'x-frame-options',
        'x-content-type-options',
        'referrer-policy',
        'permissions-policy'
      ];
      
      // Check each security header
      securityHeaders.forEach(header => {
        const value = res.headers[header];
        if (value) {
          console.log(`✅ ${header}:`, value);
        } else {
          console.log(`❌ ${header}: Not found`);
        }
      });
      
      // Check for other security-related headers
      console.log('\nOther Headers:');
      Object.keys(res.headers).forEach(header => {
        if (!securityHeaders.includes(header.toLowerCase())) {
          console.log(`${header}:`, res.headers[header]);
        }
      });
      
      resolve(res.headers);
    }).on('error', (err) => {
      console.error('Error:', err.message);
      reject(err);
    });
  });
}

// Test both development and production URLs
const urls = [
  'http://localhost:5173',  // Default Vite dev server
  // Add your production URL when deployed
  'https://app.renewglowfaceyoga.com'
];

// Run tests
async function runTests() {
  for (const url of urls) {
    try {
      await testSecurityHeaders(url);
    } catch (error) {
      console.error(`Failed to test ${url}:`, error.message);
    }
  }
}

runTests();
