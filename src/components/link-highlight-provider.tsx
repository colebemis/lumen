import React from "react"

type LinkHighlightProviderProps = {
  href: string
  children?: React.ReactNode
}

export function LinkHighlightProvider({ href, children }: LinkHighlightProviderProps) {
  // Scope styles using a unique ID
  const id = React.useMemo(() => `id-${Math.round(Math.random() * 10000000000)}`, [])
  return (
    <div id={id}>
      <style>
        {`#${id} a[href="${href}"] {
          display: inline-block;
          padding: 0 0.125rem;
          margin: 0 -0.125rem;
          color: var(--color-text-highlight);
          background-color: var(--color-bg-highlight);
        }`}
      </style>
      {children}
    </div>
  )
}
