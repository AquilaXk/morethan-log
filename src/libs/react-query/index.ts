import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분 동안 캐시 유지
      cacheTime: 10 * 60 * 1000, // 10분 동안 메모리에 보관
      refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
      refetchOnMount: false, // 컴포넌트 마운트 시 재요청 방지
    },
  },
})
