import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  // 제목 오른쪽에 두는 버튼 (예: 알림 설정)
  action?: ReactNode;
}

// TDS Top은 제목이 22px부터라, 더 작은 제목을 쓰려고 직접 만든 헤더예요.
export function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-row">
        <h1>
          {Icon && <Icon className="page-header-icon" size={20} strokeWidth={2.2} aria-hidden />}
          {title}
        </h1>
        {action}
      </div>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}
