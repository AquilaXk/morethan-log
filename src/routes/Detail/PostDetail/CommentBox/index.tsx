import { TPost } from "src/types"
import { CONFIG } from "site.config"
import dynamic from "next/dynamic"

// Giscus 컴포넌트 동적 로드 추가
const GiscusComponent = dynamic(() => import("./Giscus"), { ssr: false })
const UtterancesComponent = dynamic(() => import("./Utterances"))
const CusdisComponent = dynamic(() => import("./Cusdis"), { ssr: false })

type Props = {
  data: TPost
}

const CommentBox: React.FC<Props> = ({ data }) => {
  return (
    <div>
      {/* giscus 설정이 켜져있을 때 렌더링 */}
      {CONFIG.giscus && CONFIG.giscus.enable && <GiscusComponent />}

      {CONFIG.utterances.enable && <UtterancesComponent issueTerm={data.id} />}

      {CONFIG.cusdis.enable && (
        <CusdisComponent id={data.id} slug={data.slug} title={data.title} />
      )}
    </div>
  )
}

export default CommentBox
