"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";
import { LikertScale } from "@/components/LikertScale";
import { buildSteps, QUESTIONS } from "@/lib/questions";
import { encodeProfile, MAX_NAME_LENGTH } from "@/lib/share";

const STORAGE_KEY = "profile-assessment-draft-v1";

interface Draft {
  name: string;
  answers: Record<string, number>;
  step: number;
}

const EMPTY: Draft = { name: "", answers: {}, step: 0 };

function readDraft(): Draft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    // Older drafts may carry fields this form no longer asks for; keep only what it uses.
    const { name, answers, step } = { ...EMPTY, ...JSON.parse(raw) } as Draft;
    return { name, answers, step };
  } catch {
    return EMPTY;
  }
}

export default function AssessmentPage() {
  const router = useRouter();
  const steps = useMemo(buildSteps, []);
  const totalSteps = steps.length + 1; // step 0 is "about you"
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(readDraft());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* private mode: progress just won't persist */
    }
  }, [draft, loaded]);

  const { step, answers } = draft;
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / QUESTIONS.length) * 100);
  const current = step > 0 ? steps[step - 1] : [];
  const nameError = !draft.name.trim() ? "Please enter your name." : "";
  const stepIncomplete = step === 0 ? Boolean(nameError) : current.some((q) => !answers[q.id]);
  const isLast = step === totalSteps - 1;

  function go(to: number) {
    setShowErrors(false);
    setDraft((d) => ({ ...d, step: to }));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function next() {
    if (stepIncomplete) {
      setShowErrors(true);
      const firstMissing = current.find((q) => !answers[q.id]);
      if (firstMissing) document.getElementById(`q-${firstMissing.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (isLast) submit();
    else go(step + 1);
  }

  // Scoring happens in the browser; the report link carries the answers and name.
  function submit() {
    setSubmitting(true);
    setError("");
    let code: string;
    try {
      code = encodeProfile(draft.name, answers);
    } catch {
      setError("Some answers are missing. Please go back and check each part.");
      setSubmitting(false);
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    router.push(`/report/#${code}`);
  }

  if (!loaded) return <div className="h-64" />;

  return (
    <div ref={topRef} className="mx-auto max-w-2xl scroll-mt-6">
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {step === 0 ? "About you" : `Part ${step} of ${steps.length}`}
          </span>
          <span className="tabular-nums text-ink-muted">
            {answered}/{QUESTIONS.length} answered
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-surface-sunken"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Questionnaire progress"
        >
          <div className="h-full rounded-full bg-ink transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: totalSteps }, (_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-ink/70" : "bg-line"}`} />
          ))}
        </div>
      </div>

      {step === 0 ? (
        <div className="card space-y-5">
          <div>
            <h1 className="text-2xl font-bold">Before we start</h1>
            <p className="mt-1 text-sm text-ink-soft">
              Answer how you <em>usually</em> are, not how you think you should be. Go with your first instinct; there are
              no right answers. Your progress saves automatically on this device.
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              We only ask for your name, which appears on your report. A first name or nickname is fine. Nothing is
              saved anywhere: your report lives in its own link.
            </p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Your name</span>
            <input
              className="input"
              value={draft.name}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="name"
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              aria-invalid={showErrors && !!nameError}
            />
            {showErrors && nameError && <span className="text-xs text-social">{nameError}</span>}
          </label>
        </div>
      ) : (
        <ol className="space-y-4">
          {current.map((q, i) => {
            const missing = showErrors && !answers[q.id];
            return (
              <li
                key={q.id}
                id={`q-${q.id}`}
                className={`card scroll-mt-24 transition ${missing ? "border-social/60 ring-2 ring-social/15" : ""}`}
              >
                <p className="mb-4 font-medium">
                  <span className="mr-2 text-ink-muted tabular-nums">{(step - 1) * current.length + i + 1}.</span>
                  {q.text}
                </p>
                <LikertScale
                  name={q.id}
                  value={answers[q.id]}
                  invalid={missing}
                  onChange={(v) => setDraft((d) => ({ ...d, answers: { ...d.answers, [q.id]: v } }))}
                />
                {missing && <p className="mt-2 text-xs text-social">Please pick an answer.</p>}
              </li>
            );
          })}
        </ol>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-social/40 bg-social/5 p-3 text-sm text-social" role="alert">
          {error}
        </p>
      )}
      {showErrors && stepIncomplete && step > 0 && (
        <p className="mt-4 text-sm text-social" role="alert">
          {current.filter((q) => !answers[q.id]).length} question(s) on this page still need an answer.
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button className="btn-ghost" onClick={() => go(step - 1)} disabled={step === 0 || submitting}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button className="btn-primary" onClick={next} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Scoring&hellip;
            </>
          ) : isLast ? (
            <>
              See my profile <Send className="h-4 w-4" />
            </>
          ) : (
            <>
              Next <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
