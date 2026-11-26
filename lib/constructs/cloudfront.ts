import { Duration } from 'aws-cdk-lib';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
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
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
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
