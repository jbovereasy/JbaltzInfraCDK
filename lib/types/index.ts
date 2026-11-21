export type AwsAccount = {
    readonly accountId: string;
    readonly region: string;
}

export type DomainNames = {
    readonly main: string;
    readonly legacy: string;
}