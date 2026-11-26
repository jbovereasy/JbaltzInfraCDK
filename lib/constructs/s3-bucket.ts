import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { PolicyStatement, Effect, AnyPrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface SiteBucketProps {
  readonly noncurrentVersionExpiration?: Duration;
}

export class SiteBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: SiteBucketProps={}) {
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

    this.bucket.addToResourcePolicy(new PolicyStatement({
      effect: Effect.DENY,
      principals: [new AnyPrincipal()],
      actions: ['s3:DeleteBucket'],
      resources: [this.bucket.bucketArn],
    }));
  }
}
