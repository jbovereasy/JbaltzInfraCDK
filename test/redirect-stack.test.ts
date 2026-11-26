import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { RedirectStack } from '../lib/stacks/redirect-stack';

describe('RedirectStack', () => {
  const app = new App();
  // HostedZone.fromLookup needs a concrete account/region. In tests the lookup
  // returns a placeholder zone, so no AWS call is made.
  const stack = new RedirectStack(app, 'TestRedirectStack', {
    env: { account: '123456789012', region: 'us-east-1' },
    zoneName: 'johnbaltazar.com',
    fromDomains: ['johnbaltazar.com', 'www.johnbaltazar.com'],
    toDomain: 'jbaltz.com',
  });
  const template = Template.fromStack(stack);

  test('certificate covers both old names and validates through Route 53', () => {
    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: 'johnbaltazar.com',
      SubjectAlternativeNames: ['www.johnbaltazar.com'],
      ValidationMethod: 'DNS',
      DomainValidationOptions: Match.arrayWith([Match.objectLike({ HostedZoneId: Match.anyValue() })]),
    });
  });

  test('distribution serves both old names and runs the redirect on every request', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        Aliases: ['johnbaltazar.com', 'www.johnbaltazar.com'],
        DefaultCacheBehavior: {
          ViewerProtocolPolicy: 'allow-all',
          FunctionAssociations: [Match.objectLike({ EventType: 'viewer-request' })],
        },
      },
    });
  });

  test('IPv4 and IPv6 alias records exist for both names', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 4);
    template.hasResourceProperties('AWS::Route53::RecordSet', { Name: 'johnbaltazar.com.', Type: 'A' });
    template.hasResourceProperties('AWS::Route53::RecordSet', { Name: 'www.johnbaltazar.com.', Type: 'AAAA' });
  });

  test('no S3 bucket: the redirect needs no content', () => {
    template.resourceCountIs('AWS::S3::Bucket', 0);
  });
});
