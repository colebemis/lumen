import React from "react"
import { Link as RouterLink, LinkProps } from "react-router-dom"
import { z } from "zod"
import { Card } from "../components/card"
import { CommandMenu } from "../components/command-menu"
import { TagIcon16 } from "../components/icons"
import { LinkContext } from "../components/link-context"
import { NetworkGraph, NetworkGraphInstance } from "../components/network-graph"
import { NoteCard } from "../components/note-card"
import { getLinks, getNodes, useGlobalGraph } from "../utils/graph"
import { useSearchParam } from "../utils/use-search-param"

export const GraphContext = React.createContext<{
  selectNode?: (nodeId: string, options?: { centerInView?: boolean }) => void
  hoverNode?: (nodeId: string) => void
}>({})

export function GraphPage() {
  const [selectedId, setSelectedId] = useSearchParam("id", {
    defaultValue: "",
    schema: z.string(),
    replace: true,
  })

  const [hoveredId, setHoveredId] = React.useState<string>("")

  const graph = useGlobalGraph()
  const nodes = React.useMemo(() => getNodes(graph), [graph])
  const links = React.useMemo(() => getLinks(graph), [graph])

  const graphRef = React.useRef<NetworkGraphInstance>(null)

  const selectNode = React.useCallback(
    (id: string, options: { centerInView?: boolean } = {}) => {
      setSelectedId(id)
      setTimeout(() => {
        if (options.centerInView) graphRef.current?.centerInView(id)
        graphRef.current?.focus()
      })
    },
    [setSelectedId],
  )

  const contextValue = React.useMemo(
    () => ({ selectNode, hoverNode: setHoveredId }),
    [selectNode, setHoveredId],
  )

  return (
    <GraphContext.Provider value={contextValue}>
      <LinkContext.Provider value={Link}>
        <div className="relative h-full w-full">
          <CommandMenu />
          <NetworkGraph
            ref={graphRef}
            nodes={nodes}
            links={links}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={(node) => setSelectedId(node?.id || "")}
            onHover={(node) => setHoveredId(node?.id || "")}
          />
          {selectedId ? (
            <div className="absolute bottom-0 right-0 max-h-full w-full max-w-md overflow-auto p-4">
              {graph.getNodeAttribute(selectedId, "type") === "note" && (
                <NoteCard id={selectedId} elevation={1} />
              )}
              {graph.getNodeAttribute(selectedId, "type") === "tag" && (
                <Card className="flex justify-between p-3" elevation={1}>
                  <div className="flex items-center gap-3">
                    <div className="flex text-text-secondary">
                      <TagIcon16 />
                    </div>
                    <RouterLink to={`/tags/${selectedId}`} className="link">
                      #{selectedId}
                    </RouterLink>
                  </div>
                  <span className="text-text-secondary">{graph.degree(selectedId)} notes</span>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </LinkContext.Provider>
    </GraphContext.Provider>
  )
}

const NOTE_PATH_REGEX = /^\/(?<id>\d+)$/
const TAG_PATH_REGEX = /^\/tags\/(?<id>.+)$/

export function pathToNodeId(path: string) {
  return path.match(NOTE_PATH_REGEX)?.groups?.id ?? path.match(TAG_PATH_REGEX)?.groups?.id ?? ""
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  const { selectNode, hoverNode } = React.useContext(GraphContext)
  return (
    <RouterLink
      {...props}
      ref={ref}
      onClick={(event) => {
        if (
          typeof props.to !== "string" ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          !selectNode
        ) {
          return
        }

        const nodeId = pathToNodeId(props.to)

        if (nodeId) {
          selectNode?.(nodeId)
          event.preventDefault()
        }
      }}
      onMouseEnter={(event) => {
        if (typeof props.to !== "string" || !hoverNode) return

        const nodeId = pathToNodeId(props.to)

        if (nodeId) {
          hoverNode(nodeId)
          event.preventDefault()
        }
      }}
      onMouseLeave={() => hoverNode?.("")}
    />
  )
})
