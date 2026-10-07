"use client";

import dynamic from "next/dynamic";
import type { ExtendedRecordMap } from "notion-types";
import "react-notion-x/src/styles.css";

const NotionRenderer = dynamic(
  () => import("react-notion-x").then((mod) => mod.NotionRenderer),
  { ssr: false },
);

type NotionPageRendererProps = {
  recordMap: ExtendedRecordMap;
  rootPageId?: string;
  className?: string;
};

export function NotionPageRenderer({
  recordMap,
  rootPageId,
  className,
}: NotionPageRendererProps) {
  return (
    <div className={className ?? "notion-page"}>
      <NotionRenderer recordMap={recordMap} fullPage={false} rootPageId={rootPageId} />
    </div>
  );
}
