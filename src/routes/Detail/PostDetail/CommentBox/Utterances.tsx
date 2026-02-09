import { CONFIG } from "site.config"
import { useEffect, useRef } from "react"
import styled from "@emotion/styled"
import useScheme from "src/hooks/useScheme"

type Props = {
  issueTerm: string
}

const Utterances: React.FC<Props> = ({ issueTerm }) => {
  const [scheme] = useScheme()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const parent = containerRef.current
    if (!parent) return

    // 1. 기존 댓글창 스크립트 영역만 클리어 (테마 변경 시 중복 방지)
    // 주의: StyledWrapper 전체를 비우는 게 아니라, ref로 지정한 내부 div만 비웁니다.
    parent.innerHTML = ""

    // 2. 스크립트 생성
    const script = document.createElement("script")

    script.setAttribute("src", "https://utteranc.es/client.js")
    script.setAttribute("crossorigin", "anonymous")
    script.setAttribute("async", "true")
    script.setAttribute("issue-term", issueTerm)

    // 3. 테마 설정
    const theme = scheme === "dark" ? "github-dark" : "github-light"
    script.setAttribute("theme", theme)

    // 4. Config에서 나머지 설정 가져오기
    const config: Record<string, string> = CONFIG.utterances.config
    Object.keys(config).forEach((key) => {
      if (key !== "issue-term" && key !== "theme") {
        script.setAttribute(key, config[key])
      }
    })

    // 5. 스크립트 삽입
    parent.appendChild(script)
  }, [scheme, issueTerm])

  return (
    <StyledWrapper>
      {/* 로딩 중에 보여줄 텍스트 (Utterances가 로드되면 iframe이 이 위를 덮거나 밀어냄) */}
      <div className="loading-text">💬 댓글을 불러오고 있습니다...</div>

      {/* 실제 스크립트가 주입될 컨테이너 */}
      <div className="utterances-frame" ref={containerRef} />
    </StyledWrapper>
  )
}

export default Utterances

const StyledWrapper = styled.div`
  position: relative;
  margin-top: 2rem;

  @media (min-width: 768px) {
    margin-left: -4rem;
  }

  /* 로딩 텍스트 스타일 */
  .loading-text {
    text-align: center;
    color: var(--gray9); /* 테마에 맞는 회색 변수가 있다면 사용, 없으면 gray */
    font-size: 0.875rem;
    padding: 2rem 0;

    /* Utterances가 로드되면 자연스럽게 가려지거나 위로 밀리도록 처리 */
    position: absolute;
    width: 100%;
    top: 0;
    z-index: 0;
  }

  /* Utterances iframe이 들어갈 영역 */
  .utterances-frame {
    position: relative;
    z-index: 1; /* 로딩 텍스트보다 위에 오도록 설정 */
    min-height: 200px; /* 로딩 중 깜빡임 방지용 최소 높이 확보 */
  }
`
