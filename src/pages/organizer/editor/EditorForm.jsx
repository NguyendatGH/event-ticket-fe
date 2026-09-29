// Trình tạo / sửa sự kiện dạng 4 bước (EventEditorPage render sau khi đã có `event`, hoặc event rỗng khi tạo mới).

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useCreateOrganizerEvent, usePublishOrganizerEvent, useUpdateOrganizerEvent } from "@/api";
import { ConfirmDialog, StatusBadge } from "@/components/site";
import { formatRelative } from "@/lib/format";
import { slideStep } from "@/lib/motion";
import { OrgHeader } from "../components/OrgUi";
import { EditorActions } from "./EditorActions";
import { STEPS, draftSchema, emptyForm, errorPaths, publishChecklist, stepOfField, toForm, toRequest, validateForPublish } from "./schema";
import { applyServerErrors, normalizeServerField } from "./serverErrors";
import { StepInfo } from "./StepInfo";
import { StepNav, StepPager } from "./StepNav";
import { PublishChecklist, StepPreview } from "./StepPreview";
import { StepTiers } from "./StepTiers";
import { StepTimeVenue } from "./StepTimeVenue";
import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";

export function EditorForm({ event }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const step = Math.min(Math.max((Number(params.get("step")) || 1) - 1, 0), STEPS.length - 1);
  const isDraft = !event || event.status === "DRAFT";
  const readOnly = event?.status === "CANCELLED";

  const defaultValues = useMemo(() => (event ? toForm(event) : emptyForm()), [event]);
  const form = useForm({ resolver: zodResolver(draftSchema), defaultValues, mode: "onTouched" });
  const checklist = useWatch({ control: form.control, compute: publishChecklist });
  const { isDirty } = form.formState;

  const create = useCreateOrganizerEvent();
  const update = useUpdateOrganizerEvent();
  const publish = usePublishOrganizerEvent();
  const [busy, setBusy] = useState(null);

  const [stepNav, setStepNav] = useState({ step, dir: 1 });
  let dir = stepNav.dir;
  if (stepNav.step !== step) {
    dir = step > stepNav.step ? 1 : -1;
    setStepNav({ step, dir });
  }

  const pendingFocus = useRef(null);

  const goStep = (i, { focus } = {}) => {
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        next.set("step", String(i + 1));
        return next;
      },
      { replace: true }
    );
    window.scrollTo({ top: 0 });
    if (!focus) return;
    if (i === step) setTimeout(() => form.setFocus(focus), 60);
    else pendingFocus.current = focus;
  };

  const carried = useRef(location.state?.serverError);
  useEffect(() => {
    const err = carried.current;
    if (!err) return;
    carried.current = null;
    applyServerErrors(form, err);
  }, [form]);

  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);
  const leaveTo = (to, opts) => {
    allowNextNavigation();
    navigate(to, opts);
  };

  const showServerError = (err) => {
    const first = applyServerErrors(form, err);
    if (first) goStep(stepOfField(first), { focus: first });
    else if (err?.code?.startsWith("TIER_")) {
      form.setError("tiers.root", { type: "server", message: err.message });
      goStep(2);
    }
    toast.error(err.message || "Không lưu được sự kiện");
  };

  const persist = async (vals) => {
    const body = toRequest(vals);
    const detail = event?.id ? await update.mutateAsync({ id: event.id, body }) : await create.mutateAsync(body);
    form.reset(toForm(detail));
    return detail;
  };

  const onInvalid = (errors) => {
    const first = errorPaths(errors)[0];
    if (first) goStep(stepOfField(first), { focus: first.endsWith(".root") ? undefined : first });
    toast.error("Kiểm tra lại các trường được đánh dấu");
  };

  const onSave = async (vals) => {
    setBusy("save");
    try {
      const detail = await persist(vals);
      toast.success(isDraft ? "Đã lưu bản nháp" : "Đã lưu thay đổi");
      if (!event?.id) leaveTo(`/organizer/events/${detail.id}/edit?step=${step + 1}`, { replace: true });
    } catch (err) {
      showServerError(err);
    } finally {
      setBusy(null);
    }
  };

  const onPublish = async (vals) => {
    const issues = validateForPublish(form.getValues());
    if (issues.length) {
      issues.forEach((i) => form.setError(i.path, { type: "publish", message: i.message }));
      const first = issues[0].path;
      goStep(stepOfField(first), { focus: first.endsWith(".root") ? undefined : first });
      toast.error(`Còn ${issues.length} mục cần bổ sung trước khi xuất bản`);
      return;
    }
    setBusy("publish");
    let detail = null;
    try {
      detail = await persist(vals);
      const published = await publish.mutateAsync(detail.id);
      toast.success("Đã xuất bản sự kiện", { description: published.name });
      leaveTo(`/organizer/events/${published.id}`);
    } catch (err) {
      if (detail && !event?.id) {
        toast.error(err.message || "Chưa xuất bản được");
        const first = err.errors?.[0]?.field ? normalizeServerField(err.errors[0].field) : null;
        leaveTo(`/organizer/events/${detail.id}/edit?step=${(first ? stepOfField(first) : step) + 1}`, { replace: true, state: { serverError: { code: err.code, message: err.message, errors: err.errors } } });
      } else {
        showServerError(err);
      }
    } finally {
      setBusy(null);
    }
  };

  const save = () => form.handleSubmit(onSave, onInvalid)();
  const saveAndPublish = () => form.handleSubmit(onPublish, onInvalid)();

  const stepErrors = new Set(errorPaths(form.formState.errors).map(stepOfField));
  const stepHasError = (i) => i < 3 && stepErrors.has(i);
  const stepDone = (i) => {
    if (i >= 3 || stepErrors.has(i)) return false;
    const items = checklist.filter((c) => c.step === i);
    return items.length > 0 && items.every((c) => c.ok);
  };

  const actions = (
    <EditorActions
      isDraft={isDraft}
      busy={busy}
      readOnly={readOnly}
      isDirty={isDirty}
      missingCount={checklist.filter((i) => !i.ok).length}
      onSave={save}
      onPublish={saveAndPublish}
    />
  );

  const jump = (item) => goStep(item.step, { focus: item.path.endsWith(".root") || item.path === "coverImageUrl" ? undefined : item.path });

  return (
    <FormProvider {...form}>
      <OrgHeader
        back={event ? { to: `/organizer/events/${event.id}`, label: "Chi tiết sự kiện" } : { to: "/organizer/events", label: "Sự kiện" }}
        eyebrow={event ? "Chỉnh sửa sự kiện" : "Tạo sự kiện"}
        title={<LiveTitle fallback={event ? event.name : "Sự kiện mới"} />}
        meta={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <StatusBadge kind="event" status={event?.status || "DRAFT"} />
            {event?.updatedAt ? <span>Lưu lần cuối {formatRelative(event.updatedAt)}</span> : <span>Chưa lưu</span>}
            {isDirty ? <span className="text-warning">Có thay đổi chưa lưu</span> : null}
            {event && !isDraft && event.slug ? (
              <Link to={`/events/${event.slug}`} className="inline-flex items-center gap-1 link-quiet">
                Trang công khai
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        }
        className="border-b-0 pb-4 md:pb-6"
      />

      <div className="sticky top-14 z-20 -mx-5 border-y border-border bg-background/95 px-5 backdrop-blur-sm lg:-mx-10 lg:px-10">
        <div className="flex items-center justify-between gap-6">
          <StepNav step={step} hasError={stepHasError} isDone={stepDone} onGo={goStep} />
          <div className="hidden shrink-0 items-center gap-3 md:flex">{actions}</div>
        </div>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="grid gap-12 pt-10 pb-28 md:pb-10 xl:grid-cols-[minmax(0,1fr)_260px]"
      >
        <div className="min-w-0 overflow-x-clip">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideStep}
              initial="enter"
              animate="center"
              exit="exit"
              onAnimationComplete={(def) => {
                if (def !== "center" || !pendingFocus.current) return;
                form.setFocus(pendingFocus.current);
                pendingFocus.current = null;
              }}
            >
              {form.formState.errors.root?.server ? (
                <p role="alert" className="mb-6 border-l-2 border-destructive pl-4 text-sm text-destructive">
                  {form.formState.errors.root.server.message}
                </p>
              ) : null}
              {step === 0 ? <StepInfo disabled={readOnly} /> : null}
              {step === 1 ? <StepTimeVenue disabled={readOnly} /> : null}
              {step === 2 ? <StepTiers disabled={readOnly} published={!isDraft} /> : null}
              {step === 3 ? <StepPreview checklist={checklist} onJump={jump} /> : null}

              <StepPager step={step} onGo={goStep} />
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-36">
            <PublishChecklist items={checklist} onJump={jump} />
            {!isDraft ? <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Sự kiện đang hiển thị công khai. Thay đổi có hiệu lực ngay khi lưu.</p> : null}
          </div>
        </aside>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-end gap-3 border-t border-border bg-background px-5 shadow-[0_-8px_24px_rgba(0,0,0,.4)] pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        {actions}
      </div>

      <ConfirmDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => !open && blocker.reset?.()}
        title="Rời trang khi chưa lưu?"
        description="Các thay đổi chưa lưu trong sự kiện này sẽ mất."
        confirmLabel="Rời trang"
        cancelLabel="Ở lại"
        destructive
        onConfirm={() => blocker.proceed?.()}
      />
    </FormProvider>
  );
}

function LiveTitle({ fallback }) {
  const name = useWatch({ name: "name" });
  return name?.trim() || fallback;
}
