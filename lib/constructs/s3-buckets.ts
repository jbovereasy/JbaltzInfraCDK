import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface WebsiteBucketProps {
  readonly noncurrentVersionExpiration?: Duration;
}

export class WebsiteBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: WebsiteBucketProps={}) {
    super(scope, id);

    this.bucket = new Bucket(this, 'Bucket', {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        enforceSSL: true,
        encryption: BucketEncryption.S3_MANAGED,
        minimumTLSVersion: 1.2,
        removalPolicy: RemovalPolicy.RETAIN,
        versioned: true,
        lifecycleRules: [
            {
                noncurrentVersionExpiration: props.noncurrentVersionExpiration ?? Duration.days(7),
            },
        ],
    });
  }
}
