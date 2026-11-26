import { Duration } from 'aws-cdk-lib';
import { Certificate, CertificateValidation, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  Distribution,
  FunctionCode,
  FunctionEventType,
  FunctionRuntime,
  HttpVersion,
  PriceClass,
  ResponseHeadersPolicy,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
  Function as CloudFrontFunction,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AaaaRecord, ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { wwwRedirectCode } from '../utils/www-redirect';

export interface ContentDistroProps {
  readonly bucket: IBucket;
  readonly certificate: ICertificate;
  readonly domainNames: string[];
  readonly canonicalDomain: string;
}

export class ContentDistro extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: ContentDistroProps) {
    super(scope, id);

    if (!props.domainNames.includes(props.canonicalDomain)) {
      throw new Error(`canonicalDomain "${props.canonicalDomain}" must be one of domainNames.`);
    }
    const redirectHosts = props.domainNames.filter((name) => name !== props.canonicalDomain);

    const redirectFunction = new CloudFrontFunction(this, 'CanonicalRedirect', {
      code: FunctionCode.fromInline(wwwRedirectCode(props.canonicalDomain, redirectHosts)),
      runtime: FunctionRuntime.JS_2_0,
      comment: `301 ${redirectHosts.join(', ')} to ${props.canonicalDomain}`,
    });

    this.distribution = new Distribution(this, 'Distribution', {
      domainNames: props.domainNames,
      certificate: props.certificate,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(props.bucket),
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
        functionAssociations: [
          { function: redirectFunction, eventType: FunctionEventType.VIEWER_REQUEST },
        ],
      },
      defaultRootObject: 'index.html',
      priceClass: PriceClass.PRICE_CLASS_ALL,
      httpVersion: HttpVersion.HTTP2_AND_3,
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: '/404.html',
        ttl: Duration.minutes(5),
      })),
    });
  }
}

export interface DomainRedirectProps {
  readonly fromDomains: string[];
  readonly toDomain: string;
  readonly hostedZone: IHostedZone;
}

/**
 * 301-redirects every request for `fromDomains` to https://<toDomain>, keeping the path and query string.
 * Self-contained: its own certificate, distribution, edge function and DNS records. No bucket, no origin calls.
 */
export class DomainRedirect extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: DomainRedirectProps) {
    super(scope, id);

    if (props.fromDomains.length === 0) {
      throw new Error('DomainRedirect needs at least one domain in fromDomains.');
    }
    const [mainDomain, ...otherDomains] = props.fromDomains;

    const certificate = new Certificate(this, 'Certificate', {
      domainName: mainDomain,
      subjectAlternativeNames: otherDomains,
      validation: CertificateValidation.fromDns(props.hostedZone),
    });

    const redirectFunction = new CloudFrontFunction(this, 'RedirectFunction', {
      code: FunctionCode.fromInline(wwwRedirectCode(props.toDomain, props.fromDomains)),
      runtime: FunctionRuntime.JS_2_0,
      comment: `301 ${props.fromDomains.join(', ')} to ${props.toDomain}`,
    });

    this.distribution = new Distribution(this, 'Distribution', {
      comment: `Redirect to ${props.toDomain}`,
      domainNames: props.fromDomains,
      certificate,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: PriceClass.PRICE_CLASS_ALL,
      httpVersion: HttpVersion.HTTP2_AND_3,
      defaultBehavior: {
        // A distribution must have an origin, but the function answers every request first,
        // so this is never called.
        origin: new HttpOrigin(props.toDomain),
        viewerProtocolPolicy: ViewerProtocolPolicy.ALLOW_ALL,
        functionAssociations: [
          { function: redirectFunction, eventType: FunctionEventType.VIEWER_REQUEST },
        ],
      },
    });

    const target = RecordTarget.fromAlias(new CloudFrontTarget(this.distribution));
    for (const domain of props.fromDomains) {
      new ARecord(this, `A-${domain}`, { zone: props.hostedZone, recordName: domain, target });
      new AaaaRecord(this, `AAAA-${domain}`, { zone: props.hostedZone, recordName: domain, target });
    }
  }
}
