import { AwsAccount } from '../types';

// Load .env from the project root if it exists. In CI there is no .env file;
// the variable comes from the pipeline's environment instead.
try {
  process.loadEnvFile();
} catch {
  // No .env file: fall back to the real environment.
}

const accountId = process.env.AWS_ACCOUNT_ID;

if (!accountId || !/^\d{12}$/.test(accountId)) {
  throw new Error(
    'AWS_ACCOUNT_ID must be set to a 12-digit AWS account ID. Copy .env.example to .env and fill it in.',
  );
}

export const AWS_ACCOUNT: AwsAccount = {
  accountId,
  region: 'us-east-1',
};
