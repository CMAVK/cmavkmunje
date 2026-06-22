import type { IconType } from "react-icons";
import {
  TbReceiptTax,
  TbReportMoney,
  TbPercentage,
  TbBook2,
  TbChartBar,
  TbBuildingSkyscraper,
  TbWorld,
  TbUsersGroup,
  TbRocket,
  TbBuildingBank,
  TbGavel,
  TbBuildingFactory2,
  TbBuildingCommunity,
  TbShoppingCart,
  TbCode,
  TbHeartRateMonitor,
  TbSchool,
  TbHeartHandshake,
  TbTruck,
  TbTool,
} from "react-icons/tb";

const map: Record<string, IconType> = {
  // services
  gst: TbReceiptTax,
  tax: TbReportMoney,
  tds: TbPercentage,
  accounting: TbBook2,
  cost: TbChartBar,
  company: TbBuildingSkyscraper,
  fema: TbWorld,
  labour: TbUsersGroup,
  startup: TbRocket,
  finance: TbBuildingBank,
  litigation: TbGavel,
  // industries
  factory: TbBuildingFactory2,
  construction: TbTool,
  building: TbBuildingCommunity,
  trade: TbShoppingCart,
  rocket: TbRocket,
  code: TbCode,
  health: TbHeartRateMonitor,
  education: TbSchool,
  ngo: TbHeartHandshake,
  truck: TbTruck,
};

export default function ServiceIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const Icon = map[name] ?? TbReceiptTax;
  return <Icon className={className} aria-hidden="true" />;
}
