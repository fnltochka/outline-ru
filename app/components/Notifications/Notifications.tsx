import { observer } from "mobx-react";
import { MarkAsReadIcon, SettingsIcon } from "outline-icons";
import * as React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { s } from "@shared/styles";
import Notification from "~/models/Notification";
import { navigateToNotificationSettings } from "~/actions/definitions/navigation";
import { markNotificationsAsRead } from "~/actions/definitions/notifications";
import useActionContext from "~/hooks/useActionContext";
import useStores from "~/hooks/useStores";
import { hover } from "~/styles";
import Desktop from "~/utils/Desktop";
import Empty from "../Empty";
import ErrorBoundary from "../ErrorBoundary";
import Flex from "../Flex";
import NudeButton from "../NudeButton";
import PaginatedList from "../PaginatedList";
import Scrollable from "../Scrollable";
import Text from "../Text";
import Tooltip from "../Tooltip";
import NotificationListItem from "./NotificationListItem";

type Props = {
  /** Callback when the notification panel wants to close. */
  onRequestClose: () => void;
};

/**
 * A panel containing a list of notifications and controls to manage them.
 */
function Notifications(
  { onRequestClose }: Props,
  ref: React.RefObject<HTMLDivElement>
) {
  const context = useActionContext();
  const { notifications } = useStores();
  const { t } = useTranslation();
  const isEmpty = notifications.orderedData.length === 0;

  // Update the notification count in the dock icon, if possible.
  React.useEffect(() => {
    // Account for old versions of the desktop app that don't have the
    // setNotificationCount method on the bridge.
    if (Desktop.bridge && "setNotificationCount" in Desktop.bridge) {
      void Desktop.bridge.setNotificationCount(
        notifications.approximateUnreadCount
      );
    }
  }, [notifications.approximateUnreadCount]);

  return (
    <ErrorBoundary>
      <Flex style={{ width: "100%" }} column>
        <Header justify="space-between">
          <Text weight="bold" as="span">
            {t("Notifications")}
          </Text>
          <Text color="textSecondary" as={Flex} gap={8}>
            {notifications.approximateUnreadCount > 0 && (
              <Tooltip delay={500} content={t("Mark all as read")}>
                <Button action={markNotificationsAsRead} context={context}>
                  <MarkAsReadIcon />
                </Button>
              </Tooltip>
            )}
            <Tooltip delay={500} content={t("Settings")}>
              <Button action={navigateToNotificationSettings} context={context}>
                <SettingsIcon />
              </Button>
            </Tooltip>
          </Text>
        </Header>
        <React.Suspense fallback={null}>
          <Scrollable ref={ref} flex topShadow>
            <PaginatedList
              fetch={notifications.fetchPage}
              items={notifications.orderedData}
              renderItem={(item: Notification) => (
                <NotificationListItem
                  key={item.id}
                  notification={item}
                  onNavigate={onRequestClose}
                />
              )}
            />
          </Scrollable>
        </React.Suspense>
        {isEmpty && (
          <EmptyNotifications>{t("You're all caught up")}.</EmptyNotifications>
        )}
      </Flex>
    </ErrorBoundary>
  );
}

const EmptyNotifications = styled(Empty)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const Button = styled(NudeButton)`
  color: ${s("textSecondary")};

  &:${hover},
  &:active {
    color: ${s("text")};
    background: ${s("sidebarControlHoverBackground")};
  }
`;

const Header = styled(Flex)`
  padding: 8px 12px 12px;
  height: 44px;

  ${Button} {
    opacity: 0.75;
    transition: opacity 250ms ease-in-out;
  }

  &:${hover},
  &:focus-within {
    ${Button} {
      opacity: 1;
    }
  }
`;

export default observer(React.forwardRef(Notifications));
