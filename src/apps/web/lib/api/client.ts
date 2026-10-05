import type { AxiosInstance } from "axios";
import { getRealClient, isMockMode } from "./realClient";
import { getMockClient } from "./mockClient";
import type { MockClient } from "./mockClient";

export type ApiClient =
  | { kind: "mock"; mock: MockClient }
  | { kind: "real"; real: AxiosInstance };

export function getApiClient(): ApiClient {
  if (isMockMode()) {
    return { kind: "mock", mock: getMockClient() };
  }
  return { kind: "real", real: getRealClient() };
}
