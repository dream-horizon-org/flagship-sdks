# @flagship/js-provider

Flagship OpenFeature provider for JavaScript/TypeScript

## Installation

```bash
npm install @flagship/js-provider @openfeature/web-sdk
```

## Usage

```typescript
import { OpenFeature } from '@openfeature/web-sdk';
import { FlagshipProvider } from '@flagship/js-provider';

const provider = new FlagshipProvider({
  baseURL: 'https://api.flagship.io',
  flagshipApiKey: 'your-api-key',
  refreshInterval: 30
});

OpenFeature.setProvider(provider);
```

## Development

```bash
npm install
npm run build
npm run build:watch
```

