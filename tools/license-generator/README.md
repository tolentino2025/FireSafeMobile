# FireSafe ITM License Key Generator

License key generator for FireSafe ITM application.

## Security Model

**Important**: This license system provides **deterrent-level protection**, not cryptographic security.

### Limitations
- The validation algorithm is embedded in the mobile app
- Determined attackers with access to the app code could potentially forge keys
- This is suitable for preventing casual copying, not for high-security scenarios

### For stronger protection, consider:
- Server-side license validation (requires internet connectivity)
- Hardware-bound licensing (device ID)
- Obfuscation of the app code

## Usage

### Generate License Keys

```bash
cd tools/license-generator

# Generate 1 key with 6-month validity (default)
node generate-license.js

# Generate key with custom validity (in months)
node generate-license.js 12

# Generate multiple keys
node generate-license.js 6 5
```

### Validate License Keys

```bash
node generate-license.js validate FIRE-XXXX-XXXX-XXXX
```

## Key Format

License keys follow the format: `FIRE-XXXX-XXXX-XXXX`

The 12 characters after "FIRE-" encode:
- Positions 0-1: Validity period (months, encoded in base-32)
- Positions 2-3: Random salt
- Positions 4-9: Signature (derived from validity + salt)
- Positions 10-11: Checksum

## API

```javascript
const { generateLicenseKey, validateLicenseKey } = require('./generate-license');

// Generate a key with 6 months validity
const key = generateLicenseKey(6);

// Generate a key with 12 months validity
const key = generateLicenseKey(12);

// Validate a key
const result = validateLicenseKey(key);
// result: { valid: true, validityMonths: 6, salt: 'XX' }
// or: { valid: false, error: 'Invalid signature' }
```

## Distribution

- Keep this generator tool private
- Only distribute the generated license keys to authorized users
- The app validates keys offline using the embedded algorithm
