import * as cdk from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import * as StaticStack from '../lib/stacks/static-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/stacks/StaticStack.ts
test('SQS Queue Created', () => {
  const app = new cdk.App();
    // WHEN
  const stack = new StaticStack.StaticStack(app, 'JbaltzInfraCdkQueue');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300
  });
});
