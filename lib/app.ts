#!/usr/bin/env node
import { App } from 'aws-cdk-lib/core';
import { Environment } from 'aws-cdk-lib';
import { StaticStack } from './stacks/static-stack';
import { AWS_ACCOUNT } from './config/account';

const app = new App();

export const accountConfig: Environment = {
  account: AWS_ACCOUNT.accountId,
  region: AWS_ACCOUNT.region,
};

new StaticStack(app, 'JbaltzStaticStack', {
  env: accountConfig
});
