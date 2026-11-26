# JbaltzInfraCDK

Infrastructure for jbaltz.com (AWS CDK, TypeScript). Design: [docs/hld.md](docs/hld.md).

## Setup

```sh
cp .env.example .env   # then set AWS_ACCOUNT_ID to your 12-digit account ID
npm ci
npx cdk diff --all
```

## CDK project notes

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   type-check the project
* `npm run watch`   watch for changes and type-check
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
