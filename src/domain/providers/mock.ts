import { MailboxProvider, MailboxProvisionResult, ProviderProvisionInput } from "./types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeProvider(name: string): MailboxProvider {
  return {
    name,
    async provision(input: ProviderProvisionInput): Promise<MailboxProvisionResult[]> {
      const results: MailboxProvisionResult[] = [];
      for (const mb of input.mailboxes) {
        await delay(800 + Math.floor(Math.random() * 700));
        const email = `mailbox${mb.index + 1}@${input.domain}`;
        const failed = Math.random() < 0.2;
        results.push({
          index: mb.index,
          email,
          status: failed ? "FAILED" : "ACTIVE",
          error: failed ? "Provider provisioning failed" : undefined,
        });
      }
      return results;
    },
  };
}

export const googleProvider = makeProvider("google");
export const microsoftProvider = makeProvider("microsoft");
