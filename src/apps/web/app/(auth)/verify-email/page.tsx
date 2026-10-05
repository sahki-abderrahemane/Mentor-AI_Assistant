import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { mockVerifyEmailPageParams } from "./actions";

export const metadata = { title: "Verify your email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  await mockVerifyEmailPageParams(token);
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Your email is verified</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You can now sign in to MentorAI.
          </p>
        </div>
        <Button asChild>
          <Link href="/login">Continue to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
