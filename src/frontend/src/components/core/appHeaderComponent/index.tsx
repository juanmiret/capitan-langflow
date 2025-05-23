import AlertDropdown from "@/alerts/alertDropDown";
import DataStaxLogo from "@/assets/DataStaxLogo.svg?react";
import LangflowLogo from "@/assets/LangflowLogo.svg?react";
import ForwardedIconComponent from "@/components/common/genericIconComponent";
import ShadTooltip from "@/components/common/shadTooltipComponent";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CustomOrgSelector } from "@/customization/components/custom-org-selector";
import { CustomProductSelector } from "@/customization/components/custom-product-selector";
import { ENABLE_DATASTAX_LANGFLOW } from "@/customization/feature-flags";
import { useCustomNavigate } from "@/customization/hooks/use-custom-navigate";
import useTheme from "@/customization/hooks/use-custom-theme";
import { useResetDismissUpdateAll } from "@/hooks/use-reset-dismiss-update-all";
import useAlertStore from "@/stores/alertStore";
import useFlowsManagerStore from "@/stores/flowsManagerStore";
import { useFolderStore } from "@/stores/foldersStore";
import { useEffect, useRef, useState } from "react";
import { AccountMenu } from "./components/AccountMenu";
import FlowMenu from "./components/FlowMenu";
import LangflowCounts from "./components/langflow-counts";

export default function AppHeader(): JSX.Element {
  const notificationCenter = useAlertStore((state) => state.notificationCenter);
  const navigate = useCustomNavigate();
  const [activeState, setActiveState] = useState<"notifications" | null>(null);
  const lastPath = window.location.pathname.split("/").filter(Boolean).pop();
  const notificationRef = useRef<HTMLButtonElement | null>(null);
  const notificationContentRef = useRef<HTMLDivElement | null>(null);
  useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isNotificationButton = notificationRef.current?.contains(target);
      const isNotificationContent =
        notificationContentRef.current?.contains(target);

      if (!isNotificationButton && !isNotificationContent) {
        setActiveState(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useResetDismissUpdateAll();

  const flows = useFlowsManagerStore((state) => state.flows);
  const examples = useFlowsManagerStore((state) => state.examples);
  const folders = useFolderStore((state) => state.folders);

  const isEmpty = flows?.length !== examples?.length || folders?.length > 1;

  return (
    <div
      className={`flex h-[44px] w-full items-center justify-between border-b p-6 dark:bg-background ${
        !isEmpty ? "hidden" : ""
      }`}
      data-testid="app-header"
    >
      {/* Left Section */}
      <div
        className={`z-30 flex items-center gap-2`}
        data-testid="header_left_section_wrapper"
      >
        <Button
          unstyled
          onClick={() => navigate("/")}
          className="mr-1 flex h-8 w-8 items-center"
          data-testid="icon-ChevronLeft"
        >
          {ENABLE_DATASTAX_LANGFLOW ? (
            <DataStaxLogo className="fill-black dark:fill-[white]" />
          ) : (
            <LangflowLogo className="h-5 w-6" />
          )}
        </Button>
        {ENABLE_DATASTAX_LANGFLOW && (
          <>
            <CustomOrgSelector />
            <CustomProductSelector />
          </>
        )}
      </div>

      {/* Middle Section */}
      <div className="w-full flex-1 truncate lg:absolute lg:left-1/2 lg:-translate-x-1/2">
        <FlowMenu />
      </div>

      {/* Right Section */}
      <div
        className={`relative left-3 z-30 flex items-center gap-2`}
        data-testid="header_right_section_wrapper"
      >
        {!ENABLE_DATASTAX_LANGFLOW && (
          <>
            <Button
              unstyled
              className="hidden items-center whitespace-nowrap pr-2 2xl:inline"
              onClick={() =>
                window.open("https://github.com/langflow-ai/langflow", "_blank")
              }
            >
              <LangflowCounts />
            </Button>
          </>
        )}
        <AlertDropdown
          notificationRef={notificationContentRef}
          onClose={() => setActiveState(null)}
        >
          <ShadTooltip
            content="Notifications and errors"
            side="bottom"
            styleClasses="z-10"
          >
            <AlertDropdown onClose={() => setActiveState(null)}>
              <Button
                ref={notificationRef}
                unstyled
                onClick={() =>
                  setActiveState((prev) =>
                    prev === "notifications" ? null : "notifications",
                  )
                }
                data-testid="notification_button"
              >
                <span
                  className={
                    notificationCenter
                      ? `absolute right-[5.3rem] top-[10px] h-1 w-1 rounded-full bg-destructive`
                      : "hidden"
                  }
                />
                <ForwardedIconComponent
                  name="Bell"
                  className="side-bar-button-size ml-1 h-4 w-4 text-muted-foreground"
                  strokeWidth={2}
                />
                <span className="hidden whitespace-nowrap">Notifications</span>
              </Button>
            </AlertDropdown>
          </ShadTooltip>
        </AlertDropdown>
        <Separator
          orientation="vertical"
          className="my-auto ml-3 h-7 dark:border-zinc-700"
        />
        {ENABLE_DATASTAX_LANGFLOW && (
          <>
            <ShadTooltip content="Docs" side="bottom" styleClasses="z-10">
              <Button
                variant="ghost"
                className="flex text-sm font-medium"
                onClick={() =>
                  window.open(
                    "https://docs.datastax.com/en/langflow/index.html",
                    "_blank",
                  )
                }
              >
                <ForwardedIconComponent
                  name="book-open-text"
                  className="side-bar-button-size h-[18px] w-[18px]"
                />
                <span className="hidden whitespace-nowrap 2xl:inline">
                  Docs
                </span>
              </Button>
            </ShadTooltip>
            <ShadTooltip content="Settings" side="bottom" styleClasses="z-10">
              <Button
                data-testid="user-profile-settings"
                variant="ghost"
                className="flex text-sm font-medium"
                onClick={() => navigate("/settings")}
              >
                <ForwardedIconComponent
                  name="Settings"
                  className="side-bar-button-size h-[18px] w-[18px]"
                />
                <span className="hidden whitespace-nowrap 2xl:inline">
                  Settings
                </span>
              </Button>
            </ShadTooltip>
            <Separator
              orientation="vertical"
              className="my-auto h-7 dark:border-zinc-700"
            />
          </>
        )}
        <div className="flex">
          <AccountMenu />
        </div>
      </div>
    </div>
  );
}
