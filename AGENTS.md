# AGENTS.md

This is an AWS CDK app written in TypeScript. The app entry point is
`lib/app.ts`, which creates the `App` and two stacks: `JbaltzStaticStack`
(`lib/stacks/static-stack.ts`) and `JBRedirectStack`
(`lib/stacks/redirect-stack.ts`). Reusable constructs are in `lib/constructs/`.
`cdk.json` tells the CDK Toolkit how to run the app
(`npx tsc && npx tsx lib/app.ts`).

Both stacks are live in production. Treat the deployed setup as the baseline:
keep `npx cdk diff` clean unless the user asked for an infrastructure change, and
do not rename construct IDs (that replaces live resources). Site content in
`site/` is deployed with `aws s3 sync` plus a CloudFront invalidation, not
through CDK (see README.md).

## Read the construct library docs before writing code

AWS CDK service documentation ships inside the aws-cdk-lib package. After you
install dependencies with `npm install` (so `node_modules/aws-cdk-lib` exists)
and before you write your CDK constructs, find the service READMEs once:

```
find node_modules/aws-cdk-lib -name README.md
```

For each AWS service you use in this app, read that service's module README (for
example, `node_modules/aws-cdk-lib/aws-s3/README.md`) first and follow its
documented construct usage and patterns. Not every service has a README; a
missing one is not an error. Read the relevant READMEs before writing the
constructs for each service.

Before reading a service README, list its section headings with
`grep -n '^#' node_modules/aws-cdk-lib/<module>/README.md`, then read only the
sections for the constructs you use, for example with
`sed -n '<start>,<end>p' node_modules/aws-cdk-lib/<module>/README.md`. Do not
read a whole README into context or re-read a section you have already read.

## Check your work

- `npm run build` — type-check the project.
- `npm run test` — run the jest unit tests.
- `npx cdk synth` — synthesize the CloudFormation templates (needs `.env`).
- `npx cdk diff` — compare both stacks against production. It is read-only;
  `diff` takes no `--all` flag.
- `npx cdk deploy <stack>` (or `--all`) changes the production AWS account. Ask
  the user first.

## More resources

- [AWS CDK Reference](https://docs.aws.amazon.com/cdk/api/)
