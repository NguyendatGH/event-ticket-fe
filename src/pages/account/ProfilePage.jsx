/**
 * Thông tin tài khoản, route "/me/profile" (cần đăng nhập, nằm trong AccountLayout).
 * Dữ liệu: useMe (GET /auth/me, dùng chung cache với RootLayout nên không tốn request thêm).
 * Các thẻ: tóm tắt hồ sơ, thông tin cá nhân (ProfileForm → PUT /users/me), đổi mật khẩu (PasswordForm → PUT /users/me/password),
 * ban tổ chức (link dashboard hoặc mời nâng cấp), đăng xuất (chỉ < lg; ≥ lg nằm trong menu trái).
 */
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, KeyRound, LogOut, Store, UserRound, UserRoundPen } from "lucide-react";
import { toast } from "sonner";
import { useMe } from "@/api";
import { AccountPageHeader, AccountSection } from "@/components/account";
import { ErrorState, UserAvatar } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatDate } from "@/lib/format";
import { fadeUp, stagger } from "@/lib/motion";
import { useAuthStore, isOrganizerRole } from "@/stores/auth";
import { PasswordForm } from "./components/PasswordForm";
import { ProfileForm } from "./components/ProfileForm";
import { ProfileSkeleton } from "./components/ProfileSkeleton";

const ROLE_LABEL = { CUSTOMER: "Thành viên", ORGANIZER: "Nhà tổ chức", ADMIN: "Quản trị viên" };

/** Thẻ tóm tắt đầu trang: avatar tròn, tên, email, vai trò, ngày tham gia (nền có ánh xanh nhẹ góc trái). */
function ProfileSummary({ user }) {
  return (
    <section aria-labelledby="profile-name" className="relative overflow-hidden rounded-card bg-card p-5 ring-1 ring-white/5 md:p-7">
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_0%_0%,rgba(45,194,117,0.2),transparent_70%)]" />
      <div className="relative flex items-center gap-4 sm:gap-5">
        <UserAvatar
          user={user}
          size="xl"
          className="size-16 rounded-full text-lg ring-2 ring-primary/70 ring-offset-4 ring-offset-card sm:size-24 sm:text-2xl"
          fallbackClassName="rounded-full bg-primary/15 text-primary font-bold"
        />
        <div className="min-w-0 space-y-2">
          <h2 id="profile-name" className="text-xl font-bold wrap-break-word text-foreground sm:text-2xl">
            {user.fullName}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="break-all">{user.email}</span>
            <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-semibold text-primary">{ROLE_LABEL[user.role] || user.role}</span>
            {user.createdAt ? <span>Tham gia từ {formatDate(user.createdAt)}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function OrganizerBlock({ user }) {
  if (isOrganizerRole(user)) {
    const org = user.organizer;
    return (
      <div className="space-y-6">
        {org ? (
          <div className="flex items-center gap-4">
            <UserAvatar name={org.name} src={org.logoUrl} size="lg" className="rounded-full" fallbackClassName="rounded-full" />
            <div className="space-y-1">
              <p className="text-lg font-bold text-foreground">{org.name}</p>
              <Link to={`/organizers/${org.slug}`} className="text-sm link-quiet">
                Xem trang công khai
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tài khoản quản trị chưa gắn với ban tổ chức nào.</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/organizer">Mở bảng điều khiển</Link>
          </Button>
          {org ? (
            <Button asChild variant="secondary">
              <Link to="/organizer/profile">Sửa hồ sơ ban tổ chức</Link>
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-lg text-sm leading-relaxed text-secondary-foreground">
        Bạn tổ chức hòa nhạc, workshop hay hội thảo? Tạo hồ sơ ban tổ chức để đăng sự kiện và bán vé ngay trên nền tảng.
      </p>
      <Button asChild className="shrink-0">
        <Link to="/become-organizer">
          Trở thành nhà tổ chức
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

/** Leaf đăng xuất (< lg): useAuth (theo dõi store) nằm ở đây để trang không render lại khi RootLayout đồng bộ user vào store. */
function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const onLogout = async () => {
    navigate("/", { replace: true });
    await logout();
    toast.success("Đã đăng xuất");
  };
  return (
    <Button variant="secondary" className="w-full lg:hidden" onClick={onLogout}>
      <LogOut aria-hidden="true" />
      Đăng xuất
    </Button>
  );
}

// Cache /auth/me chưa có → hiện tạm user trong store (đọc một lần, không đăng ký store).
const storeUser = () => useAuthStore.getState().user ?? undefined;

export default function ProfilePage() {
  useDocumentTitle("Thông tin tài khoản");
  // Cùng cache /auth/me với RootLayout: không gọi thêm request.
  const profile = useMe({ placeholderData: storeUser });
  const user = profile.data;

  let content;
  if (profile.isError && !user) content = <ErrorState error={profile.error} onRetry={profile.refetch} />;
  else if (!user) content = <ProfileSkeleton />;
  else
    content = (
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp}>
          <ProfileSummary user={user} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <AccountSection id="personal" icon={UserRoundPen} title="Thông tin cá nhân" description="Tên và số điện thoại được điền sẵn khi bạn đặt vé.">
            <ProfileForm user={user} />
          </AccountSection>
        </motion.div>
        <motion.div variants={fadeUp}>
          <AccountSection id="password" icon={KeyRound} title="Đổi mật khẩu" description="Dùng mật khẩu dài, không trùng với tài khoản khác.">
            <PasswordForm />
          </AccountSection>
        </motion.div>
        <motion.div variants={fadeUp}>
          <AccountSection
            id="organizer"
            icon={Store}
            title="Ban tổ chức"
            description={isOrganizerRole(user) ? "Quản lý sự kiện, doanh thu và hồ sơ công khai." : "Bán vé cho sự kiện của riêng bạn."}
          >
            <OrganizerBlock user={user} />
          </AccountSection>
        </motion.div>
        <LogoutButton />
      </motion.div>
    );

  return (
    <>
      <AccountPageHeader icon={UserRound} title="Thông tin tài khoản" description="Hồ sơ, mật khẩu và quyền ban tổ chức của bạn." />
      {content}
    </>
  );
}
