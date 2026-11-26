import { Stack, StackProps } from 'aws-cdk-lib';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { DomainRedirect } from '../constructs/cloudfront';

export interface RedirectStackProps extends StackProps {
  readonly zoneName: string;
  readonly fromDomains: string[];
  readonly toDomain: string;
}

export class RedirectStack extends Stack {
  constructor(scope: Construct, id: string, props: RedirectStackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, 'Zone', { domainName: props.zoneName });

    new DomainRedirect(this, 'Redirect', {
      fromDomains: props.fromDomains,
      toDomain: props.toDomain,
      hostedZone,
    });
  }
}
