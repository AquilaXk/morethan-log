import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { ExtendedRecordMap } from "notion-types"
import useScheme from "src/hooks/useScheme"

// core styles shared by all of react-notion-x (required)
import "react-notion-x/src/styles.css"

// used for code syntax highlighting (optional)
import "prismjs/themes/prism-tomorrow.css"

// used for rendering equations (optional)

import "katex/dist/katex.min.css"
import { FC, useEffect, useRef } from "react"
import styled from "@emotion/styled"

const _NotionRenderer = dynamic(
  () => import("react-notion-x").then((m) => m.NotionRenderer),
  { ssr: false }
)

const Code = dynamic(() =>
  import("react-notion-x/build/third-party/code").then(async (m) => m.Code)
)

const Collection = dynamic(() =>
  import("react-notion-x/build/third-party/collection").then(
    (m) => m.Collection
  )
)
const Equation = dynamic(() =>
  import("react-notion-x/build/third-party/equation").then((m) => m.Equation)
)
const Pdf = dynamic(
  () => import("react-notion-x/build/third-party/pdf").then((m) => m.Pdf),
  {
    ssr: false,
  }
)
const Modal = dynamic(
  () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
  {
    ssr: false,
  }
)

const mapPageUrl = (id: string) => {
  return "https://www.notion.so/" + id.replace(/-/g, "")
}

type Props = {
  recordMap: ExtendedRecordMap
}

const NotionRenderer: FC<Props> = ({ recordMap }) => {
  const [scheme] = useScheme()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = wrapperRef.current
    if (!root) return
    let isApplyingEnhancements = false

    const applyAdmonitions = () => {
      const callouts = root.querySelectorAll<HTMLElement>(".notion-callout")
      callouts.forEach((callout) => {
        callout.classList.remove(
          "notion-admonition",
          "notion-admonition-tip",
          "notion-admonition-info",
          "notion-admonition-warning"
        )
        callout.removeAttribute("data-admonition-title")

        const icon = callout
          .querySelector<HTMLElement>(".notion-page-icon-inline")
          ?.textContent?.trim()

        let kind: "tip" | "info" | "warning" | null = null
        if (icon?.includes("💡")) kind = "tip"
        if (icon?.includes("ℹ") || icon?.includes("ℹ️")) kind = "info"
        if (icon?.includes("⚠") || icon?.includes("⚠️")) kind = "warning"
        if (!kind) return

        callout.classList.add("notion-admonition", `notion-admonition-${kind}`)
        callout.setAttribute(
          "data-admonition-title",
          kind === "tip" ? "Tip" : kind === "info" ? "Info" : "Warning"
        )
      })
    }

    const applySimpleTableColumnWidths = () => {
      const tables = root.querySelectorAll<HTMLTableElement>(".notion-simple-table")
      tables.forEach((table) => {
        const rows = Array.from(table.rows)
        if (!rows.length) return

        const colCount = rows.reduce(
          (max, row) => Math.max(max, row.cells.length),
          0
        )
        if (!colCount) return

        const weights = Array.from({ length: colCount }, () => 1)

        rows.forEach((row) => {
          Array.from(row.cells).forEach((cell, colIdx) => {
            const text = (cell.textContent || "").replace(/\s+/g, " ").trim()
            const len = text.length
            // Keep a sane range so one long sentence doesn't consume the entire table.
            const normalized = Math.max(6, Math.min(40, len))
            weights[colIdx] = Math.max(weights[colIdx], normalized)
          })
        })

        const total = weights.reduce((sum, w) => sum + w, 0)
        if (!total) return
        const widthSignature = weights.join(",")
        if (table.dataset.colWidthSignature === widthSignature) return

        let colgroup = table.querySelector("colgroup[data-autosize='true']")
        if (!colgroup) {
          colgroup = document.createElement("colgroup")
          colgroup.setAttribute("data-autosize", "true")
          table.prepend(colgroup)
        }
        colgroup.innerHTML = ""

        weights.forEach((weight) => {
          const col = document.createElement("col")
          col.style.width = `${(weight / total) * 100}%`
          colgroup!.appendChild(col)
        })
        table.dataset.colWidthSignature = widthSignature
      })
    }

    const applyEnhancements = () => {
      if (isApplyingEnhancements) return
      isApplyingEnhancements = true
      try {
        applyAdmonitions()
        applySimpleTableColumnWidths()
      } finally {
        isApplyingEnhancements = false
      }
    }

    applyEnhancements()

    const observer = new MutationObserver(() => {
      if (isApplyingEnhancements) return
      applyEnhancements()
    })
    observer.observe(root, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [recordMap, scheme])

  return (
    <StyledWrapper ref={wrapperRef}>
      <_NotionRenderer
        darkMode={scheme === "dark"}
        recordMap={recordMap}
        components={{
          Code,
          Collection,
          Equation,
          Modal,
          Pdf,
          nextImage: Image,
          nextLink: Link,
        }}
        mapPageUrl={mapPageUrl}
      />
    </StyledWrapper>
  )
}

export default NotionRenderer

const StyledWrapper = styled.div`
  /* // TODO: why render? */
  .notion-collection-page-properties {
    display: none !important;
  }
  .notion-page {
    padding: 0;
  }
  .notion-list {
    width: 100%;
  }

  .notion-callout.notion-admonition {
    --ad-header-h: 52px;
    --ad-accent: #10acc6;
    --ad-header-bg: #d8e8ee;
    --ad-body-bg: #eceff1;
    --ad-border: #dde2e7;
    --ad-text: #4e5e68;
    --ad-icon-bg: #10acc6;
    --ad-strip-w: 8px;
    --ad-icon-svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='21' fill='%2310acc6'/%3E%3Crect x='22' y='19' width='4' height='14' rx='2' fill='white'/%3E%3Ccircle cx='24' cy='13' r='3' fill='white'/%3E%3C/svg%3E");
    position: relative;
    display: block;
    border: 0;
    border-radius: 8px;
    overflow: hidden;
    padding: 0;
    background: linear-gradient(
      to right,
      var(--ad-accent) 0 var(--ad-strip-w),
      var(--ad-body-bg) var(--ad-strip-w) 100%
    );
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    color: var(--ad-text);
  }

  .notion-callout.notion-admonition::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    height: var(--ad-header-h);
    background: linear-gradient(
      to right,
      transparent 0 var(--ad-strip-w),
      var(--ad-header-bg) var(--ad-strip-w) 100%
    );
    background-image:
      linear-gradient(
        to right,
        transparent 0 var(--ad-strip-w),
        var(--ad-header-bg) var(--ad-strip-w) 100%
      ),
      linear-gradient(
        to right,
        transparent 0 var(--ad-strip-w),
        var(--ad-border) var(--ad-strip-w) 100%
      );
    background-repeat: no-repeat;
    background-size:
      100% calc(100% - 1px),
      100% 1px;
    background-position:
      left top,
      left bottom;
    z-index: 1;
    pointer-events: none;
  }

  .notion-callout.notion-admonition::after {
    content: "";
    position: absolute;
    left: var(--ad-strip-w);
    top: 0;
    right: 0;
    bottom: 0;
    border: 1px solid var(--ad-border);
    border-left: 0;
    border-radius: 0 8px 8px 0;
    z-index: 0;
    pointer-events: none;
  }

  .notion-callout.notion-admonition > * {
    position: relative;
    z-index: 2;
  }

  .notion-callout.notion-admonition .notion-callout-text::before {
    content: attr(data-admonition-title);
    position: absolute;
    left: 58px;
    top: calc(var(--ad-header-h) / 2);
    transform: translateY(-50%);
    color: var(--ad-accent);
    font-size: 1.2rem;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: 0;
  }

  .notion-callout.notion-admonition .notion-callout-text::after {
    content: "";
    position: absolute;
    left: 24px;
    top: calc(var(--ad-header-h) / 2);
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    background-image: var(--ad-icon-svg);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .notion-callout.notion-admonition .notion-page-icon-inline {
    display: none;
  }

  .notion-callout.notion-admonition .notion-callout-text {
    margin-left: 0;
    padding: 64px 32px 18px 32px;
    color: var(--ad-text);
  }

  .notion-callout.notion-admonition .notion-text {
    color: var(--ad-text);
    font-size: 0.98rem;
    line-height: 1.6;
  }

  .notion-callout.notion-admonition-tip {
    --ad-accent: #e08600;
    --ad-header-bg: #ebe2d4;
    --ad-body-bg: #ececec;
    --ad-icon-svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='21' fill='%23f39200'/%3E%3Cpath d='M24 10c-6 0-10 4.6-10 10.2 0 3.3 1.5 5.4 3.5 7.3 1.4 1.3 2.5 2.8 2.5 4.8h8c0-2 1.1-3.5 2.5-4.8 2-1.9 3.5-4 3.5-7.3C34 14.6 30 10 24 10z' fill='white'/%3E%3Crect x='20' y='33' width='8' height='3' rx='1.5' fill='white'/%3E%3Crect x='21' y='37' width='6' height='2.5' rx='1.25' fill='white'/%3E%3C/svg%3E");
  }

  .notion-callout.notion-admonition-info {
    --ad-accent: #1098b0;
    --ad-header-bg: #d8e8ee;
    --ad-body-bg: #eceff1;
    --ad-icon-svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='21' fill='%2310acc6'/%3E%3Crect x='22' y='19' width='4' height='14' rx='2' fill='white'/%3E%3Ccircle cx='24' cy='13' r='3' fill='white'/%3E%3C/svg%3E");
  }

  .notion-callout.notion-admonition-warning {
    --ad-accent: #c86a73;
    --ad-header-bg: #f0dee2;
    --ad-body-bg: #f1eaec;
    --ad-icon-svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpolygon points='24,4 45,41 3,41' fill='%23d96c77'/%3E%3Crect x='22' y='16' width='4' height='14' rx='2' fill='white'/%3E%3Ccircle cx='24' cy='34' r='2.5' fill='white'/%3E%3C/svg%3E");
  }

  .notion-callout.notion-admonition-tip .notion-callout-text::before {
    content: "Tip";
  }

  .notion-callout.notion-admonition-info .notion-callout-text::before {
    content: "Info";
  }

  .notion-callout.notion-admonition-warning .notion-callout-text::before {
    content: "Warning";
  }

  .notion-table-view,
  .notion-table,
  .notion-simple-table {
    border: none;
    border-radius: 12px;
    overflow: hidden;
    background: transparent;
  }

  .notion-simple-table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    table-layout: fixed;
  }

  .notion-simple-table td {
    border: 0;
    padding: 14px 18px;
    border-right: 1px solid var(--fg-color-1);
    border-bottom: 1px solid var(--fg-color-1);
    background: transparent;
    vertical-align: middle;
  }

  .notion-simple-table tr td:last-child {
    border-right: 0;
  }

  .notion-simple-table tr:last-child td {
    border-bottom: 0;
  }

  .notion-simple-table tr:first-child td {
    background: var(--bg-color-0);
    font-weight: 700;
    border-bottom: 2px solid
      ${({ theme }) =>
        theme.scheme === "dark"
          ? "rgba(255, 255, 255, 0.22)"
          : "rgba(0, 0, 0, 0.16)"};
  }

  .notion-code,
  pre[class*="language-"] {
    border-radius: 12px;
  }

  .notion.dark-mode .notion-code,
  .notion.dark-mode pre[class*="language-"] {
    background-color: #1f232a;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .notion.dark-mode :not(pre) > code[class*="language-"] {
    background-color: #1f232a;
  }
`
