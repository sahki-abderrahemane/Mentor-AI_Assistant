import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { TooltipProvider } from "@/providers/tooltip-provider";
import { AuthInitProvider } from "@/providers/auth-init-provider";
import { RightPanelProvider } from "@/providers/right-panel-provider";
import { ToastProvider } from "@/providers/toast-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MentorAI — Research Workspace",
    template: "%s · MentorAI",
  },
  description:
    "MentorAI is a NotebookLM-inspired research workspace for ingesting documents, building knowledge collections, chatting with sources, and fine-tuning models.",
  applicationName: "MentorAI",
  keywords: [
    "MentorAI",
    "research",
    "RAG",
    "fine-tuning",
    "knowledge",
    "documents",
    "AI",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground font-sans min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              <RightPanelProvider>
                <AuthInitProvider>{children}</AuthInitProvider>
              </RightPanelProvider>
            </TooltipProvider>
          </QueryProvider>
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
