export interface MailboxProvisionResult {
  index: number;
  email: string;
  status: "ACTIVE" | "FAILED";
  error?: string;
}

export interface ProviderProvisionInput {
  orderId: string;
  domain: string;
  mailboxes: { index: number }[];
}

export interface MailboxProvider {
  readonly name: string;
  provision(input: ProviderProvisionInput): Promise<MailboxProvisionResult[]>;
}
