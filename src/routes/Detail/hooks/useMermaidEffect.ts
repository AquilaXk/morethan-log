import { useEffect } from "react"
import useScheme from "src/hooks/useScheme"
const useMermaidEffect = () => {
  const [scheme] = useScheme()

  useEffect(() => {
    if (typeof document === "undefined") return

    let disposed = false
    let running = false

    const renderMermaidBlocks = async () => {
      const blocks = Array.from(
        document.querySelectorAll<HTMLElement>("pre.language-mermaid")
      )
      if (!blocks.length) return

      const mermaid = (await import("mermaid")).default
      const theme = scheme === "dark" ? "dark" : "default"

      mermaid.initialize({
        startOnLoad: false,
        theme,
      })

      for (let i = 0; i < blocks.length; i += 1) {
        if (disposed) return
        const block = blocks[i]
        const source =
          block.dataset.mermaidSource || block.textContent?.trim() || ""
        if (!source) continue

        const alreadyRendered =
          block.dataset.mermaidRendered === "true" &&
          block.dataset.mermaidSource === source &&
          block.dataset.mermaidTheme === theme
        if (alreadyRendered) continue

        const id = `mermaid-${i}-${Math.random().toString(36).slice(2)}`
        const { svg } = await mermaid.render(id, source)
        if (disposed) return

        block.dataset.mermaidSource = source
        block.dataset.mermaidTheme = theme
        block.dataset.mermaidRendered = "true"
        block.innerHTML = svg
      }
    }

    const run = async () => {
      if (running || disposed) return
      running = true
      try {
        await renderMermaidBlocks()
      } catch (error) {
        console.warn(error)
      } finally {
        running = false
      }
    }

    run()

    const observer = new MutationObserver(() => {
      if (disposed) return
      run()
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      disposed = true
      observer.disconnect()
    }
  }, [scheme])

  return
}

export default useMermaidEffect
