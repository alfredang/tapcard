"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Surface } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label, FieldError } from "@/components/ui/input";

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();

  function update(key: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    const res = await fetch("/api/contact-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <Surface className="flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-success" />
        <h3 className="text-lg font-semibold">Thanks — we&apos;ll be in touch!</h3>
        <p className="text-sm text-muted-foreground">
          Our team will reach out within one business day.
        </p>
      </Surface>
    );
  }

  return (
    <Surface className="p-6">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="c-name">Name</Label>
            <Input id="c-name" value={form.name} onChange={update("name")} required />
          </div>
          <div>
            <Label htmlFor="c-company">Company</Label>
            <Input
              id="c-company"
              value={form.company}
              onChange={update("company")}
            />
          </div>
          <div>
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              type="email"
              value={form.email}
              onChange={update("email")}
              required
            />
          </div>
          <div>
            <Label htmlFor="c-phone">Phone</Label>
            <Input id="c-phone" value={form.phone} onChange={update("phone")} />
          </div>
        </div>
        <div>
          <Label htmlFor="c-message">Message</Label>
          <Textarea
            id="c-message"
            value={form.message}
            onChange={update("message")}
            placeholder="Tell us about your team and what you're looking for…"
            required
          />
        </div>
        <FieldError message={error} />
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Book a demo
        </Button>
      </form>
    </Surface>
  );
}
