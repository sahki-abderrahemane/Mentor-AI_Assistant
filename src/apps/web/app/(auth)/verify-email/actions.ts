"use server";

export async function mockVerifyEmailPageParams(token: string): Promise<void> {
  // No-op in mock mode. Backend will land here once the NestJS API exists.
  void token;
}
