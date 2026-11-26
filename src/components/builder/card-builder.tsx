"use client";
import {
  CardDesignBanner,
  DESIGN_NAMES,
} from "@/components/card/card-design-banner";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Check,
  Loader2,
  Eye,
  Trash2,
  ExternalLink,
  Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkedInIcon } from "@/components/icons/brand";
import { linkedinUrl } from "@/lib/whatsapp";
import { Surface, Badge } from "@/components/ui/card";
import { Section, TextField, AreaField } from "@/components/builder/fields";
import { AiButton } from "@/components/builder/ai-button";
import { CardView } from "@/components/card/card-view";
import { SharePanel } from "@/components/card/share-panel";
import { PageHeader } from "@/components/app/page-header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/toast";
import { THEME_LIST, getTheme } from "@/lib/themes";
import { cardCompleteness, resolveAccent, type CardData } from "@/lib/card";
import { appUrl } from "@/lib/utils";
import type { UserPrefs } from "@/lib/user-prefs";

type BuilderState = CardData & { published?: boolean };

const EMPTY: BuilderState = {
  fullName: "",
  theme: "MODERN",
  accentColor: "",
  published: false,
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

// ─── Two-way sync with the app ──────────────────────────────────────────────
// The app edits the same card (design, accent, photo, banner…). The builder
// keeps `baseline` — the card as the server last told us — and:
//  • saves only the fields the owner changed here (a stale tab can't put back
//    the old design the app just set), and
//  • polls the server on focus and every 15 s, taking every field the owner
//    hasn't touched here. Mirrors the iOS app's cardChanges/applying (1.6.9).
const NOT_SYNCED = new Set([
  "id", "slug", "countryCode", "userId", "gallery", "createdAt", "updatedAt",
]);
const POLL_MS = 15_000;

function same(a: unknown, b: unknown) {
  const norm = (v: unknown) =>
    v === null || v === undefined
      ? ""
      : typeof v === "object"
        ? JSON.stringify(v)
        : v;
  return norm(a) === norm(b);
}

function changedFields(next: BuilderState, base: BuilderState) {
  const out: Record<string, unknown> = {};
  const n = next as unknown as Record<string, unknown>;
  const b = base as unknown as Record<string, unknown>;
  for (const k of new Set([...Object.keys(n), ...Object.keys(b)])) {
    if (NOT_SYNCED.has(k)) continue;
    if (!same(n[k], b[k])) out[k] = n[k] ?? null;
  }
  return out;
}

function syncedFields(card: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(card)) {
    if (!NOT_SYNCED.has(k)) out[k] = v;
  }
  return out as Partial<BuilderState>;
}

/**
 * Reads an image File, downscales it to fit maxDim px on a canvas, and returns a
 * compact JPEG data URL — so an uploaded laptop photo is stored inline without
 * bloating the database (mirrors the app's approach).
 */
async function fileToScaledDataUrl(
  file: File,
  maxDim = 720,
  quality = 0.8,
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
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
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-12 w-12 rounded-md border border-white/10 object-cover"
          />
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15 disabled:opacity-50"
        >
          {busy ? "Processing…" : "Upload file"}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-danger text-sm hover:underline"
          >
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
  version: initialVersion,
  prefs,
  linkedinEnabled = false,
}: {
  initialCard?: BuilderState;
  cardId?: string;
  /// The card's updatedAt (ISO) as loaded — the poll asks "changed since?".
  version?: string;
  /// Whether "Sign In with LinkedIn" is configured, for the photo import.
  linkedinEnabled?: boolean;
  /// The account's synced preferences (country code for phone links, default
  /// QR mode) — shared with the iOS app's Settings.
  prefs?: UserPrefs;
}) {
  const router = useRouter();
  const [state, setState] = useState<BuilderState>(initialCard ?? EMPTY);
  const [cardId, setCardId] = useState<string | undefined>(initialId);
  const [slug, setSlug] = useState<string | undefined>(
    initialCard?.slug ?? undefined,
  );
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [confirmDel, setConfirmDel] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);
  const baseline = useRef<BuilderState>(initialCard ?? EMPTY);
  const version = useRef<string | undefined>(initialVersion);
  const saveGen = useRef(0);
  const pulling = useRef(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  const needsName = !state.fullName?.trim();

  const set = useCallback(
    (key: keyof BuilderState) => (value: unknown) =>
      setState((s) => ({ ...s, [key]: value })),
    [],
  );

  const persist = useCallback(
    async (next: BuilderState) => {
      if (!next.fullName?.trim()) return;
      const changes = cardId ? changedFields(next, baseline.current) : null;
      if (changes && Object.keys(changes).length === 0) return;
      saveGen.current += 1;
      setStatus("saving");
      try {
        if (cardId && changes) {
          const res = await fetch(`/api/cards/${cardId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes),
          });
          if (!res.ok) throw new Error();
          const { card } = await res.json();
          baseline.current = { ...baseline.current, ...changes } as BuilderState;
          // Don't adopt card.updatedAt: the next poll then re-reads the card
          // once, picking up anything the app saved just before this PATCH.
          void card;
        } else {
          const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(next),
          });
          if (!res.ok) throw new Error();
          const { card } = await res.json();
          baseline.current = { ...next, ...syncedFields(card) };
          version.current = card.updatedAt;
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

  // Take the server's copy of every field the owner hasn't changed here.
  // Returns whether anything on screen changed.
  const applyServer = useCallback((card: Record<string, unknown>) => {
    const server = syncedFields(card);
    const base = { ...baseline.current } as unknown as Record<string, unknown>;
    const cur = stateRef.current as unknown as Record<string, unknown>;
    const incoming = Object.entries(server).filter(
      ([k, v]) => same(cur[k], base[k]) && !same(cur[k], v),
    );
    baseline.current = { ...baseline.current, ...server };
    if (typeof card.updatedAt === "string") version.current = card.updatedAt;
    if (incoming.length === 0) return false;
    setState((s) => {
      const merged = { ...s } as unknown as Record<string, unknown>;
      for (const [k, v] of incoming) if (same(merged[k], base[k])) merged[k] = v;
      return merged as unknown as BuilderState;
    });
    return true;
  }, []);

  const pull = useCallback(async () => {
    if (!cardId || pulling.current) return;
    if (document.visibilityState !== "visible") return;
    pulling.current = true;
    const gen = saveGen.current;
    try {
      const since = version.current
        ? `?since=${encodeURIComponent(version.current)}`
        : "";
      const res = await fetch(`/api/cards/${cardId}${since}`, {
        cache: "no-store",
      });
      if (res.status !== 200) return;
      const { card } = await res.json();
      // A save started meanwhile: this copy may predate it — skip it, the
      // next poll reads the card again.
      if (gen !== saveGen.current) return;
      if (applyServer(card)) {
        toast.info("Updated with changes from the Tapcard app");
      }
    } catch {
      /* offline — try again on the next poll */
    } finally {
      pulling.current = false;
    }
  }, [cardId, applyServer]);

  useEffect(() => {
    if (!cardId) return;
    const onWake = () => void pull();
    window.addEventListener("focus", onWake);
    document.addEventListener("visibilitychange", onWake);
    const t = setInterval(onWake, POLL_MS);
    return () => {
      window.removeEventListener("focus", onWake);
      document.removeEventListener("visibilitychange", onWake);
      clearInterval(t);
    };
  }, [cardId, pull]);

  // Profile photo from LinkedIn (the server reads it through the owner's
  // LinkedIn connection). Not connected yet → connect, then come back here
  // with ?linkedinPhoto=1 to finish the import.
  const importLinkedInPhoto = useCallback(async () => {
    if (!cardId) return;
    setPhotoBusy(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/linkedin-photo`, {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.card) {
        const photo = body.card.profilePhoto as string;
        baseline.current = { ...baseline.current, profilePhoto: photo };
        setState((s) => ({ ...s, profilePhoto: photo }));
        toast.success("Profile photo updated from LinkedIn");
        return;
      }
      if (body.connect && linkedinEnabled) {
        await signIn("linkedin", {
          redirectTo: `/cards/${cardId}/edit?linkedinPhoto=1`,
        });
        return;
      }
      if (body.connect) {
        toast.error(
          "LinkedIn sign-in isn't switched on for this site yet. Save your LinkedIn photo and upload it instead.",
        );
        const profile = linkedinUrl(state.linkedin);
        if (profile) window.open(profile, "_blank", "noopener");
        return;
      }
      toast.error(body.error || "Couldn't import your LinkedIn photo");
    } finally {
      setPhotoBusy(false);
    }
  }, [cardId, linkedinEnabled, state.linkedin]);

  useEffect(() => {
    if (!cardId) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("linkedinPhoto") !== "1") return;
    const t = setTimeout(() => {
      url.searchParams.delete("linkedinPhoto");
      window.history.replaceState(null, "", url.pathname + url.search);
      void importLinkedInPhoto();
    }, 0);
    return () => clearTimeout(t);
    // Run once, on the return from LinkedIn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

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
    toast.success(
      next.published ? "Card published — it's now live" : "Card unpublished",
    );
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
      <PageHeader
        title="Card Builder"
        description="Changes preview instantly and save automatically."
      >
        {needsName ? (
          <span className="bg-warning/15 text-warning flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={remove}
          aria-label="Delete card"
          className="text-muted-foreground hover:bg-danger/10 hover:text-danger"
        >
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
            {cardId && (
              <button
                type="button"
                onClick={importLinkedInPhoto}
                disabled={photoBusy}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-2 disabled:opacity-50"
              >
                {photoBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkedInIcon className="h-4 w-4" />
                )}
                Use my LinkedIn photo
              </button>
            )}
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
            <TextField
              label="Mobile"
              value={state.mobile ?? ""}
              onChange={set("mobile")}
            />
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
            <TextField
              label="Address"
              value={state.address ?? ""}
              onChange={set("address")}
            />
          </Section>

          <Section title="Social Links" step={4}>
            <TextField
              label="LinkedIn"
              value={state.linkedin ?? ""}
              onChange={set("linkedin")}
            />
            <TextField
              label="X (Twitter)"
              value={state.twitter ?? ""}
              onChange={set("twitter")}
            />
            <TextField
              label="Instagram"
              value={state.instagram ?? ""}
              onChange={set("instagram")}
            />
            <TextField
              label="Facebook"
              value={state.facebook ?? ""}
              onChange={set("facebook")}
            />
            <TextField
              label="YouTube"
              value={state.youtube ?? ""}
              onChange={set("youtube")}
            />
            <TextField
              label="TikTok"
              value={state.tiktok ?? ""}
              onChange={set("tiktok")}
            />
            <TextField
              label="Telegram"
              value={state.telegram ?? ""}
              onChange={set("telegram")}
            />
          </Section>
        </div>

        {/* Center — live preview */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <div className="mb-3 flex items-center justify-between">
              <Badge tone="primary">
                <Eye className="h-3 w-3" /> Live preview
              </Badge>
              <span className="text-muted-foreground text-xs">
                {completeness}% complete
              </span>
            </div>
            <CardView card={{ ...state, countryCode: prefs?.countryCode }} />
          </div>
        </div>

        {/* Right — design + publish + share */}
        <div className="order-3 space-y-4">
          <Surface className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Design templates</h3>
            <div className="grid grid-cols-3 gap-2">
              {THEME_LIST.map((t) => (
                <button
                  key={t.key}
                  onClick={() => set("theme")(t.key)}
                  className={`rounded-lg border p-1 text-center transition ${
                    state.theme === t.key
                      ? "border-primary ring-primary/40 ring-2"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span
                    className="relative mb-1 block h-16 w-full overflow-hidden rounded"
                    style={{ background: t.bannerGradient }}
                  >
                    <CardDesignBanner theme={t.key} />
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {DESIGN_NAMES[t.key]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="flex items-center justify-between text-sm">
                <span className="font-medium">Accent color</span>
                <span className="flex items-center gap-2">
                  {state.accentColor &&
                    resolveAccent(state.accentColor, "") && (
                      <button
                        type="button"
                        onClick={() => set("accentColor")("")}
                        className="text-muted-foreground hover:text-foreground text-xs"
                      >
                        Match design
                      </button>
                    )}
                  <input
                    type="color"
                    value={resolveAccent(
                      state.accentColor,
                      getTheme(state.theme).accent,
                    )}
                    onChange={(e) => set("accentColor")(e.target.value)}
                    className="border-border h-8 w-12 cursor-pointer rounded border bg-transparent"
                  />
                </span>
              </label>
            </div>
          </Surface>

          <Surface className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Publish</h3>
                <p className="text-muted-foreground text-xs">
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
                className="text-primary mt-3 flex items-center gap-1.5 text-xs hover:underline"
              >
                <Globe2 className="h-3.5 w-3.5" /> {appUrl(`/c/${slug}`)}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </Surface>

          {slug ? (
            <Surface className="p-4">
              <h3 className="mb-3 text-sm font-semibold">Share & QR</h3>
              <SharePanel
                card={{ ...state, slug, countryCode: prefs?.countryCode }}
                qrMode={prefs?.qrMode}
                whatsappQr={prefs?.whatsappQr}
              />
            </Surface>
          ) : (
            <Surface className="text-muted-foreground p-4 text-sm">
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
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    );
  if (status === "saved")
    return (
      <span className="text-success flex items-center gap-1.5 text-xs">
        <Check className="h-3.5 w-3.5" /> Saved
      </span>
    );
  if (status === "error")
    return <span className="text-danger text-xs">Save failed</span>;
  return null;
}
