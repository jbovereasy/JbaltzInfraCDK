import { Stack, StackProps } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { WEB_DOMAIN } from '../config/domains';
import { ContentDistro } from '../constructs/cloudfront';
import { SiteBucket } from '../constructs/s3-bucket';

export class StaticStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const domainNames = [WEB_DOMAIN.main, `www.${WEB_DOMAIN.main}`];

    const certificate = new Certificate(this, 'Certificate', {
      domainName: WEB_DOMAIN.main,
      subjectAlternativeNames: domainNames.filter((name) => name !== WEB_DOMAIN.main),
      validation: CertificateValidation.fromDns(),
    });

    const website = new SiteBucket(this, 'Website');

    new ContentDistro(this, 'Cdn', {
      bucket: website.bucket,
      certificate,
      domainNames,
      canonicalDomain: WEB_DOMAIN.main,
    });
  }
}
