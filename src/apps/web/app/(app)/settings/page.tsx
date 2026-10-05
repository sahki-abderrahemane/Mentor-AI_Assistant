"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { usePreferencesStore } from "@/stores/preferences.store";
import { toast } from "sonner";

export default function SettingsPage() {
  const prefs = usePreferencesStore();

  async function save(fn: () => void) {
    await new Promise((r) => setTimeout(r, 300));
    fn();
    toast.success("Settings saved");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your workspace preferences.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Dark mode</p><p className="text-xs text-muted-foreground">Use dark theme across the app.</p></div>
            <Switch checked={prefs.darkMode} onCheckedChange={(v) => save(() => prefs.setDarkMode(v))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Compact mode</p><p className="text-xs text-muted-foreground">Reduce spacing for denser layouts.</p></div>
            <Switch checked={prefs.compactMode} onCheckedChange={(v) => save(() => prefs.setCompactMode(v))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Show line numbers</p><p className="text-xs text-muted-foreground">Display line numbers in code blocks.</p></div>
            <Switch checked={prefs.showLineNumbers} onCheckedChange={(v) => save(() => prefs.setShowLineNumbers(v))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Chat</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Stream responses</p><p className="text-xs text-muted-foreground">Stream LLM responses as they are generated.</p></div>
            <Switch checked={prefs.streamResponses} onCheckedChange={(v) => save(() => prefs.setStreamResponses(v))} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Show citations</p><p className="text-xs text-muted-foreground">Show inline citations in chat responses.</p></div>
            <Switch checked={prefs.showCitations} onCheckedChange={(v) => save(() => prefs.setShowCitations(v))} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}