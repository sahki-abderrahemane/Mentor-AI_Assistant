"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGenerateFlashcards, useGenerateQuiz, useGenerateStudyGuide } from "../hooks/useGeneration";

export type GenerateKind = "quiz" | "flashcards" | "study-guide";

export interface GenerateSourceOption {
  id: string;
  title: string;
}

export interface GenerateCollectionOption {
  id: string;
  name: string;
}

interface GenerateDialogProps {
  kind: GenerateKind;
  documents: GenerateSourceOption[];
  collections?: GenerateCollectionOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId?: string;
}

const KIND_CONFIG = {
  quiz: { title: "Generate quiz with AI", countLabel: "Number of questions", defaultCount: 5, maxCount: 20 },
  flashcards: { title: "Generate flashcards with AI", countLabel: "Number of cards", defaultCount: 10, maxCount: 40 },
  "study-guide": { title: "Generate study guide with AI", countLabel: "", defaultCount: 0, maxCount: 0 },
} satisfies Record<GenerateKind, unknown>;

export function GenerateDialog({
  kind,
  documents,
  collections,
  open,
  onOpenChange,
  documentId,
}: GenerateDialogProps) {
  const config = KIND_CONFIG[kind];
  const [source, setSource] = React.useState<string>(documentId ? `doc:${documentId}` : "");
  const [title, setTitle] = React.useState("");
  const [count, setCount] = React.useState(config.defaultCount);

  const generateQuiz = useGenerateQuiz();
  const generateFlashcards = useGenerateFlashcards();
  const generateStudyGuide = useGenerateStudyGuide();

  const isPending =
    generateQuiz.isPending || generateFlashcards.isPending || generateStudyGuide.isPending;

  const resetAndClose = () => {
    setSource(documentId ? `doc:${documentId}` : "");
    setTitle("");
    setCount(config.defaultCount);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || isPending) return;

    const [type, id] = source.split(":");
    const payload = type === "doc" ? { documentId: id } : { collectionId: id };
    const trimmedTitle = title.trim();

    try {
      if (kind === "quiz") {
        await generateQuiz.mutateAsync({ ...payload, title: trimmedTitle || undefined, questionCount: count });
      } else if (kind === "flashcards") {
        await generateFlashcards.mutateAsync({
          ...payload,
          name: trimmedTitle || undefined,
          cardCount: count,
        });
      } else {
        await generateStudyGuide.mutateAsync({ ...payload, title: trimmedTitle || undefined });
      }
      toast.success(
        kind === "quiz" ? "Quiz generated" : kind === "flashcards" ? "Flashcard deck generated" : "Study guide generated",
      );
      resetAndClose();
    } catch {
      toast.error("Generation failed. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>
            Pick a source and the AI will build it for you.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="generate-source">Source</Label>
            <Select value={source} onValueChange={setSource} required disabled={isPending}>
              <SelectTrigger id="generate-source" className="w-full">
                <SelectValue placeholder="Select a document or collection…" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Documents</SelectLabel>
                  {documents.map((doc) => (
                    <SelectItem key={`doc:${doc.id}`} value={`doc:${doc.id}`}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
                {collections && collections.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>Collections</SelectLabel>
                    {collections.map((col) => (
                      <SelectItem key={`col:${col.id}`} value={`col:${col.id}`}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="generate-title">Title (optional)</Label>
            <Input
              id="generate-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={kind === "flashcards" ? "Deck name" : "Title"}
              disabled={isPending}
            />
          </div>

          {kind !== "study-guide" && (
            <div className="space-y-2">
              <Label htmlFor="generate-count">{config.countLabel} (1–{config.maxCount})</Label>
              <Input
                id="generate-count"
                type="number"
                min={1}
                max={config.maxCount}
                value={count}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setCount(Number.isNaN(v) ? config.defaultCount : Math.min(Math.max(1, v), config.maxCount));
                }}
                disabled={isPending}
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Generating with AI — this can take up to a minute…
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!source || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
