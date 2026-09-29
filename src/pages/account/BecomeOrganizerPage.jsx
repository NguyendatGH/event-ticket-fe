// Nâng tài khoản khách thành ban tổ chức, route "/become-organizer" (cần đăng nhập, nằm trong AccountLayout).
// Dữ liệu: useBecomeOrganizer.

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { CalendarPlus, ChartNoAxesColumnIncreasing, Contact, IdCard, Receipt, Store } from "lucide-react";
import { toast } from "sonner";
import { CityInput, Field, FormRootError, SubmitButton } from "@/components/form";
import { AccountPageHeader, AccountSection } from "@/components/account";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/site";
import { useBecomeOrganizer } from "@/api";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { applyApiErrors, toPayload } from "@/lib/forms";
import { riseSm, staggerOf } from "@/lib/motion";
import { becomeOrganizerSchema } from "./schemas";

const BENEFITS = [
  [CalendarPlus, "Mở bán trong một buổi chiều", "Tạo sự kiện, đặt hạng vé và số lượng, xuất bản khi đã sẵn sàng. Bản nháp chỉ bạn thấy."],
  [ChartNoAxesColumnIncreasing, "Theo dõi doanh thu từng ngày", "Vé đã bán, doanh thu và sự kiện bán chạy trên cùng một bảng điều khiển."],
  [Store, "Trang ban tổ chức công khai", "Khán giả xem mọi sự kiện của bạn ở một địa chỉ, kèm logo và thông tin liên hệ."],
  [Receipt, "Đơn hàng của từng sự kiện", "Xem người mua, số vé và trạng thái thanh toán của từng đơn, lọc và tìm kiếm ngay trong trang sự kiện."],
];

const BENEFITS_STAGGER = staggerOf(0.06);
const FORM_STAGGER = staggerOf(0.06, 0.2);

const DEFAULTS = { name: "", description: "", contactEmail: "", contactPhone: "", website: "", city: "", logoUrl: null };

export default function BecomeOrganizerPage() {
  useDocumentTitle("Trở thành nhà tổ chức");
  const { isOrganizer, user } = useAuth();
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(becomeOrganizerSchema), defaultValues: DEFAULTS });
  const become = useBecomeOrganizer();

  if (isOrganizer && !become.isSuccess) return <Navigate to="/organizer" replace />;

  const onSubmit = (values) =>
    become.mutate(toPayload(values), {
      onSuccess: () => {
        toast.success("Hồ sơ ban tổ chức đã sẵn sàng. Tạo sự kiện đầu tiên của bạn.");
        navigate("/organizer", { replace: true });
      },
      onError: (err) => {
        if (err.code === "ALREADY_ORGANIZER") {
          toast.info(err.message || "Tài khoản đã là nhà tổ chức.");
          navigate("/organizer", { replace: true });
          return;
        }
        applyApiErrors(form, err);
      },
    });

  return (
    <>
      <AccountPageHeader
        icon={Store}
        title="Trở thành nhà tổ chức"
        description={
          <>
            Tài khoản <span className="text-foreground">{user?.email}</span> sẽ được nâng cấp. Vé và đơn hàng đã có vẫn giữ nguyên.
          </>
        }
      />

      <motion.ul
        variants={BENEFITS_STAGGER}
        initial="hidden"
        animate="show"
        aria-label="Quyền lợi ban tổ chức"
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {BENEFITS.map(([Icon, title, text]) => (
          <motion.li key={title} variants={riseSm} className="flex w-[80%] shrink-0 snap-start gap-3.5 rounded-card bg-card p-4 ring-1 ring-white/5 sm:w-auto md:p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-primary ring-1 ring-primary/30" aria-hidden="true">
              <Icon className="size-5" />
            </span>
            <div className="space-y-1">
              <p className="text-base font-bold text-foreground">{title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      <motion.div variants={FORM_STAGGER} initial="hidden" animate="show" className="mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4" aria-label="Hồ sơ ban tổ chức">
            <motion.div variants={riseSm}>
              <AccountSection as="fieldset" icon={IdCard} title="Nhận diện" description="Tên và logo hiển thị trên trang sự kiện, vé và trang ban tổ chức.">
                <div className="grid gap-8 md:grid-cols-[160px_minmax(0,1fr)] md:gap-10">
                  <div className="grid content-start gap-2">
                    <Label htmlFor="organizer-logo" className="justify-between">
                      <span>Logo</span>
                      <span className="text-caption font-normal text-disabled-foreground">Không bắt buộc</span>
                    </Label>
                    <Controller
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <ImageUpload
                          id="organizer-logo"
                          folder="organizers"
                          aspect="1/1"
                          label="Tải logo"
                          hint="Ảnh vuông, tối đa 5MB"
                          value={field.value}
                          onChange={field.onChange}
                          className="w-36 md:w-40"
                        />
                      )}
                    />
                  </div>
                  <div className="min-w-0 space-y-6">
                    <Field control={form.control} name="name" label="Tên ban tổ chức" autoComplete="organization" placeholder="Sunrise Live" />
                    <Field
                      control={form.control}
                      name="description"
                      label="Mô tả"
                      optional
                      description="Bạn tổ chức loại sự kiện nào, từ bao giờ, ở đâu."
                      render={(field) => <Textarea {...field} rows={4} />}
                    />
                  </div>
                </div>
              </AccountSection>
            </motion.div>

            <motion.div variants={riseSm}>
              <AccountSection as="fieldset" icon={Contact} title="Liên hệ" description="Khán giả dùng để hỏi về sự kiện. Có thể sửa sau trong hồ sơ ban tổ chức.">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field control={form.control} name="contactEmail" label="Email liên hệ" optional type="email" inputMode="email" placeholder={user?.email || "lienhe@email.com"} />
                  <Field control={form.control} name="contactPhone" label="SĐT liên hệ" optional type="tel" inputMode="tel" autoComplete="tel" placeholder="0912 345 678" />
                  <Field control={form.control} name="website" label="Website" optional type="url" inputMode="url" placeholder="https://" />
                  <Field control={form.control} name="city" label="Thành phố" optional render={(field) => <CityInput {...field} />} />
                </div>
              </AccountSection>
            </motion.div>

            <motion.div variants={riseSm} className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-caption text-muted-foreground sm:order-2">Miễn phí tạo hồ sơ. Phí dịch vụ chỉ tính trên vé bán được.</p>
              <div className="space-y-3">
                <FormRootError form={form} />
                <SubmitButton pending={become.isPending} pendingLabel="Đang tạo hồ sơ" size="lg" className="w-full sm:w-auto">
                  Tạo hồ sơ ban tổ chức
                </SubmitButton>
              </div>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </>
  );
}
