import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { WebsiteBucket } from '../constructs/s3-buckets';


export class StaticStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new WebsiteBucket(this, 'jbaltz');
  }
}
