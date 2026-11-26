#!/usr/bin/env node
import { App } from 'aws-cdk-lib/core';
import { Environment } from 'aws-cdk-lib';
import { StaticStack } from './stacks/static-stack';
import { RedirectStack } from './stacks/redirect-stack';
import { AWS_ACCOUNT } from './config/account';
import { WEB_DOMAIN } from './config/domains';

const app = new App();

export const accountConfig: Environment = {
  account: AWS_ACCOUNT.accountId,
  region: AWS_ACCOUNT.region,
};

new StaticStack(app, 'JbaltzStaticStack', {
  env: accountConfig
});

new RedirectStack(app, 'JBRedirectStack', {
  env: accountConfig,
  zoneName: WEB_DOMAIN.legacy,
  fromDomains: [WEB_DOMAIN.legacy, `www.${WEB_DOMAIN.legacy}`],
  toDomain: WEB_DOMAIN.main,
});
