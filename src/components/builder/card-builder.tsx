"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Eye,
  Trash2,
  ExternalLink,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface, Badge } from "@/components/ui/card";
import { Section, TextField, AreaField } from "@/components/builder/fields";
import { AiButton } from "@/components/builder/ai-button";
import { CardView } from "@/components/card/card-view";
import { SharePanel } from "@/components/card/share-panel";
import { PageHeader } from "@/components/app/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { THEME_LIST } from "@/lib/themes";
import { cardCompleteness, type CardData } from "@/lib/card";
import { appUrl } from "@/lib/utils";

type BuilderState = CardData & { published?: boolean };

const EMPTY: BuilderState = {
  fullName: "",
  theme: "MODERN",
  accentColor: "#7c5cff",
  published: false,
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Reads an image File, downscales it to fit maxDim px on a canvas, and returns a
 * compact JPEG data URL — so an uploaded laptop photo is stored inline without
 * bloating the database (mirrors the app's approach).
 */
async function fileToScaledDataUrl(file: File, maxDim = 720, quality = 0.8): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/** URL text field plus an "Upload file" button (stores the image inline as a data URL). */
function ImageField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await fileToScaledDataUrl(file));
    } catch {
      /* ignore a failed read */
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <TextField label={label} value={value} onChange={onChange} placeholder={placeholder} />
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-12 w-12 rounded-md border border-white/10 object-cover" />
        ) : null}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15 disabled:opacity-50"
        >
          {busy ? "Processing…" : "Upload file"}
        </button>
        {value ? (
          <button type="button" onClick={() => onChange("")} className="text-sm text-danger hover:underline">
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function CardBuilder({
  initialCard,
  cardId: initialId,
}: {
  initialCard?: BuilderState;
  cardId?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<BuilderState>(initialCard ?? EMPTY);
  const [cardId, setCardId] = useState<string | undefined>(initialId);
  const [slug, setSlug] = useState<string | undefined>(initialCard?.slug ?? undefined);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [confirmDel, setConfirmDel] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);
  const needsName = !state.fullName?.trim();

  const set = useCallback(
    (key: keyof BuilderState) => (value: unknown) =>
      setState((s) => ({ ...s, [key]: value })),
    [],
  );

  const persist = useCallback(
    async (next: BuilderState) => {
      if (!next.fullName?.trim()) return;
      setStatus("saving");
      try {
        if (cardId) {
          const res = await fetch(`/api/cards/${cardId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          });
          if (!res.ok) throw new Error();
        } else {
          const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          });
          if (!res.ok) throw new Error();
          const { card } = await res.json();
          setCardId(card.id);
          setSlug(card.slug);
          window.history.replaceState(null, "", `/cards/${card.id}/edit`);
        }
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    },
    [cardId],
  );

  // Debounced autosave whenever state changes.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(state), 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, persist]);

  async function togglePublish() {
    const next = { ...state, published: !state.published };
    setState(next);
    await persist(next);
    toast.success(next.published ? "Card published — it's now live" : "Card unpublished");
  }

  function remove() {
    if (!cardId) {
      router.push("/cards");
      return;
    }
    setConfirmDel(true);
  }

  async function doDelete() {
    setConfirmDel(false);
    if (!cardId) return;
    await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    toast.success("Card deleted");
    router.push("/cards");
    router.refresh();
  }

  const seed = {
    fullName: state.fullName,
    jobTitle: state.jobTitle ?? undefined,
    company: state.company ?? undefined,
  };
  const completeness = cardCompleteness(state);

  return (
    <div>
      <PageHeader title="Card Builder" description="Changes preview instantly and save automatically.">
        {needsName ? (
          <span className="flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-medium text-warning">
            Add a full name to save
          </span>
        ) : (
          <SaveBadge status={status} />
        )}
        {slug && (
          <Button variant="outline" size="sm" asChild>
            <a href={appUrl(`/c/${slug}`)} target="_blank" rel="noreferrer">
              <Eye className="h-4 w-4" /> Preview
            </a>
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={remove} aria-label="Delete card" className="text-muted-foreground hover:bg-danger/10 hover:text-danger">
          <Trash2 className="h-4 w-4" />
        </Button>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,380px)_1fr]">
        {/* Left — content */}
        <div className="order-2 space-y-3 lg:order-1">
          <Section title="Upload" step={1} defaultOpen>
            <ImageField
              label="Profile photo"
              value={state.profilePhoto ?? ""}
              onChange={set("profilePhoto")}
              placeholder="https://…/photo.jpg — or upload below"
            />
            <ImageField
              label="Company logo"
              value={state.companyLogo ?? ""}
              onChange={set("companyLogo")}
              placeholder="https://…/logo.png — or upload below"
            />
            <ImageField
              label="Cover banner"
              value={state.coverBanner ?? ""}
              onChange={set("coverBanner")}
              placeholder="https://…/banner.jpg — or upload below"
            />
          </Section>

          <Section title="Personal Details" step={2} defaultOpen>
            <TextField
              label="Full name"
              value={state.fullName}
              onChange={set("fullName")}
              placeholder="Jane Doe"
            />
            <TextField
              label="Job title"
              value={state.jobTitle ?? ""}
              onChange={set("jobTitle")}
              placeholder="Marketing Director"
            />
            <TextField
              label="Company"
              value={state.company ?? ""}
              onChange={set("company")}
            />
            <TextField
              label="Department"
              value={state.department ?? ""}
              onChange={set("department")}
            />
            <TextField
              label="Tagline"
              value={state.tagline ?? ""}
              onChange={set("tagline")}
              placeholder="A short, memorable line"
            />
            <AreaField
              label="Short bio"
              value={state.bio ?? ""}
              onChange={set("bio")}
              action={
                <AiButton action="bio" seed={seed} onResult={set("bio")} />
              }
            />
            <AreaField
              label="About me"
              value={state.about ?? ""}
              onChange={set("about")}
              action={
                <AiButton action="about" seed={seed} onResult={set("about")} />
              }
            />
          </Section>

          <Section title="Contact Details" step={3}>
            <TextField label="Mobile" value={state.mobile ?? ""} onChange={set("mobile")} />
            <TextField
              label="Office phone"
              value={state.officePhone ?? ""}
              onChange={set("officePhone")}
            />
            <TextField
              label="WhatsApp number"
              value={state.whatsapp ?? ""}
              onChange={set("whatsapp")}
              placeholder="14155550142"
            />
            <TextField
              label="Email"
              value={state.email ?? ""}
              onChange={set("email")}
              type="email"
            />
            <TextField
              label="Website"
              value={state.website ?? ""}
              onChange={set("website")}
              placeholder="https://…"
            />
            <TextField label="Address" value={state.address ?? ""} onChange={set("address")} />
          </Section>

          <Section title="Social Links" step={4}>
            <TextField label="LinkedIn" value={state.linkedin ?? ""} onChange={set("linkedin")} />
            <TextField label="X (Twitter)" value={state.twitter ?? ""} onChange={set("twitter")} />
            <TextField label="Instagram" value={state.instagram ?? ""} onChange={set("instagram")} />
            <TextField label="Facebook" value={state.facebook ?? ""} onChange={set("facebook")} />
            <TextField label="YouTube" value={state.youtube ?? ""} onChange={set("youtube")} />
            <TextField label="TikTok" value={state.tiktok ?? ""} onChange={set("tiktok")} />
            <TextField label="Telegram" value={state.telegram ?? ""} onChange={set("telegram")} />
          </Section>
        </div>

        {/* Center — live preview */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <div className="mb-3 flex items-center justify-between">
              <Badge tone="primary">
                <Eye className="h-3 w-3" /> Live preview
              </Badge>
              <span className="text-xs text-muted-foreground">
                {completeness}% complete
              </span>
            </div>
            <CardView card={state} />
          </div>
        </div>

        {/* Right — design + publish + share */}
        <div className="order-3 space-y-4">
          <Surface className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Theme</h3>
            <div className="grid grid-cols-3 gap-2">
              {THEME_LIST.map((t) => (
                <button
                  key={t.key}
                  onClick={() => set("theme")(t.key)}
                  className={`rounded-lg border p-1 text-center transition ${
                    state.theme === t.key
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span
                    className="mb-1 block h-8 w-full rounded"
                    style={{ background: t.bannerGradient }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="flex items-center justify-between text-sm">
                <span className="font-medium">Accent color</span>
                <input
                  type="color"
                  value={state.accentColor || "#7c5cff"}
                  onChange={(e) => set("accentColor")(e.target.value)}
                  className="h-8 w-12 cursor-pointer rounded border border-border bg-transparent"
                />
              </label>
            </div>
          </Surface>

          <Surface className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Publish</h3>
                <p className="text-xs text-muted-foreground">
                  {state.published ? "Card is live" : "Card is a draft"}
                </p>
              </div>
              <button
                onClick={togglePublish}
                disabled={needsName}
                title={needsName ? "Add a full name first" : undefined}
                className={`relative h-6 w-11 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  state.published ? "bg-success" : "bg-muted"
                }`}
                aria-label="Toggle publish"
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                    state.published ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            {slug && state.published && (
              <a
                href={appUrl(`/c/${slug}`)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Globe2 className="h-3.5 w-3.5" /> {appUrl(`/c/${slug}`)}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </Surface>

          {slug ? (
            <Surface className="p-4">
              <h3 className="mb-3 text-sm font-semibold">Share & QR</h3>
              <SharePanel card={{ ...state, slug }} />
            </Surface>
          ) : (
            <Surface className="p-4 text-sm text-muted-foreground">
              Add your name to create the card — your QR code and share link
              appear here.
            </Surface>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDel}
        title="Delete this card?"
        message="This permanently removes the card and its analytics. This can't be undone."
        onConfirm={doDelete}
        onCancel={() => setConfirmDel(false)}
      />
    </div>
  );
}

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    );
  if (status === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-success">
        <Check className="h-3.5 w-3.5" /> Saved
      </span>
    );
  if (status === "error")
    return <span className="text-xs text-danger">Save failed</span>;
  return null;
}
