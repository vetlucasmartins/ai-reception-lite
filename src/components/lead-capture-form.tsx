"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

type LeadCaptureFormProps = {
  businessId: string;
  businessName: string;
  services: string[];
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; response: string; leadId: string }
  | { status: "error"; message: string };

export function LeadCaptureForm({
  businessId,
  businessName,
  services
}: LeadCaptureFormProps) {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState({ status: "submitting" });

    const formData = new FormData(form);
    const payload = {
      businessId,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      requestedService: String(formData.get("requestedService") ?? ""),
      message: String(formData.get("message") ?? ""),
      source: "website"
    };

    let result:
      | {
          success: true;
          data: { leadId: string; simulatedResponse: string };
        }
      | { success: false; error: { message: string } };

    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      result = (await response.json()) as typeof result;
    } catch {
      setState({
        status: "error",
        message: "The request could not be submitted. Please try again."
      });
      return;
    }

    if (!result.success) {
      setState({
        status: "error",
        message: result.error.message
      });
      return;
    }

    form.reset();
    setState({
      status: "success",
      response: result.data.simulatedResponse,
      leadId: result.data.leadId
    });
  }

  return (
    <form
      className="grid gap-5"
      data-testid="public-lead-form"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="eyebrow">{businessName}</p>
        <h1 className="mt-2 max-w-2xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Send your request to the team.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Share the service you need, your preferred contact details, and any timing
          or budget context that would help with a useful reply.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required>
          <input
            className="field-control"
            name="name"
            required
            autoComplete="name"
          />
        </Field>
        <Field label="Email">
          <input
            className="field-control"
            name="email"
            type="email"
            autoComplete="email"
          />
        </Field>
        <Field label="Phone">
          <input
            className="field-control"
            name="phone"
            type="tel"
            autoComplete="tel"
          />
        </Field>
        <Field label="Service desired">
          <input
            className="field-control"
            list="services"
            name="requestedService"
          />
          <datalist id="services">
            {services.map((service) => (
              <option key={service} value={service} />
            ))}
          </datalist>
        </Field>
      </div>

      <Field label="Message" required>
        <textarea
          className="field-control min-h-36 resize-y py-3 leading-7"
          name="message"
          required
          maxLength={2000}
          placeholder="Example: I need an appointment this week and would like to understand the price range."
        />
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="button-primary w-full sm:w-fit"
          type="submit"
          disabled={state.status === "submitting"}
        >
          {state.status === "submitting" ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          )}
          {state.status === "submitting" ? "Sending request" : "Send request"}
        </button>
        <p className="text-sm font-medium text-slate-600">Email or phone is required.</p>
      </div>

      <div aria-live="polite">
        {state.status === "success" ? (
          <div className="status-callout-success">
            <p className="flex items-center gap-2 font-semibold">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              Simulated AI response
            </p>
            <p className="mt-2">{state.response}</p>
            <p className="mt-3 text-xs font-medium text-teal-900">Lead ID: {state.leadId}</p>
          </div>
        ) : null}
        {state.status === "error" ? (
          <div className="status-callout-error" role="alert">
            {state.message}
          </div>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="field-label">
      <span>
        {label}
        {required ? <span className="text-signal-hot"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
