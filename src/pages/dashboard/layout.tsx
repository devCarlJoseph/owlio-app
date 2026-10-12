import { Outlet } from "react-router";
import { AppSidebar } from "@/components/common/platform-sidebar";

export default function PlatformLayout() {
  return (
    <>
			<AppSidebar />
      <main>
				<Outlet />
			</main>
    </>
  );
}
