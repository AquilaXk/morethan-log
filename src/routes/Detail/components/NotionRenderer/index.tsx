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
import { FC } from "react"
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
  return (
    <StyledWrapper>
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

  .notion-callout {
    border-width: 2px;
    border-radius: 12px;
    border-color: ${({ theme }) =>
      theme.scheme === "dark"
        ? "rgba(255, 255, 255, 0.16)"
        : "rgba(0, 0, 0, 0.12)"};
  }

  .notion-table-view {
    border: 1px solid
      ${({ theme }) =>
        theme.scheme === "dark"
          ? "rgba(255, 255, 255, 0.14)"
          : "rgba(0, 0, 0, 0.12)"};
    border-radius: 12px;
    overflow: hidden;
  }

  .notion-simple-table {
    border-radius: 12px;
    overflow: hidden;
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
