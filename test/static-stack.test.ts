import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { StaticStack } from '../lib/stacks/static-stack';
import { Effect, PolicyDocument } from 'aws-cdk-lib/aws-iam';
import { Condition } from 'aws-cdk-lib/aws-glue';

describe('StaticStack', () => {
  const app = new App();
  const stack = new StaticStack(app, 'TestStack');
  const template = Template.fromStack(stack);


  test('content bucket blocks all public access', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('bucket rejects non-TLS requests', ()=> {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Deny',
            Condition: { Bool: { 'aws:SecureTransport': 'false' } },
          }),
        ]),
      },
    });
  });

  test('versioning enabled', ()=> {
    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: {
        Status: 'Enabled',
      }
    })
  })

  test('old object versions expire after 7 days', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      LifecycleConfiguration: {
        Rules: Match.arrayWith([
          Match.objectLike({
            NoncurrentVersionExpiration: { NoncurrentDays: 7 },
            Status: 'Enabled',
          })
        ])
      }
    })
  })
});
