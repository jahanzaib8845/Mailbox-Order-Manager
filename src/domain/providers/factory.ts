import { Provider } from "@prisma/client";
import { MailboxProvider } from "./types";
import { googleProvider, microsoftProvider } from "./mock";

export function getProvider(provider: Provider): MailboxProvider {
  switch (provider) {
    case "GOOGLE":
      return googleProvider;
    case "MICROSOFT":
      return microsoftProvider;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}
