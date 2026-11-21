import { App } from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import * as StaticStack from '../lib/stacks/static-stack';

test('stack synthesizes', () => {
  const app = new App();
  const stack = new StaticStack.StaticStack(app, 'TestStack');
  expect(() => Template.fromStack(stack)).not.toThrow();
});