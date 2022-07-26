import * as RovingFocusGroup from "@radix-ui/react-roving-focus"
import { useActor } from "@xstate/react"
import clsx from "clsx"
import React from "react"
import {
  NavLink as RouterNavLink,
  NavLinkProps,
  Outlet,
  useMatch,
  useResolvedPath,
} from "react-router-dom"
import { GlobalStateContext } from "../global-state"
import { toDateString } from "../utils/date"
import { Button, IconButton } from "./button"
import { Card } from "./card"
import { DropdownMenu } from "./dropdown-menu"
import {
  CalendarFillIcon24,
  CalendarIcon24,
  GraphFillIcon24,
  GraphIcon24,
  LoadingIcon16,
  MoreIcon24,
  NoteFillIcon24,
  NoteIcon24,
  TagFillIcon24,
  TagIcon24,
} from "./icons"

import { NewNoteDialog } from "./new-note-dialog"
import { Tooltip } from "./tooltip"

export function Root() {
  const globalState = React.useContext(GlobalStateContext)
  const [state, send] = useActor(globalState.service)

  // React.useEffect(() => {
  //   function onKeyDown(event: KeyboardEvent) {
  //     // Reload with `command + r`
  //     if (event.key === "r" && event.metaKey && !event.shiftKey) {
  //       send("RELOAD")
  //       event.preventDefault()
  //     }
  //   }

  //   window.addEventListener("keydown", onKeyDown)
  //   return () => window.removeEventListener("keydown", onKeyDown)
  // }, [send])

  if (state.matches("loadingContext")) {
    return null
  }

  if (state.matches("notSupported")) {
    return (
      <div className="p-4">
        <p>
          This browser is not supported. Please open Lumen in a browser that supports the{" "}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API#browser_compatibility"
            className="link"
          >
            File System Access API
          </a>
          .
        </p>
      </div>
    )
  }

  if (!state.context.directoryHandle) {
    return (
      <div className="grid h-screen place-items-center p-4 [@supports(height:100svh)]:h-[100svh]">
        <Button onClick={() => send("SHOW_DIRECTORY_PICKER")}>Connect a local folder</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="w-screent grid h-screen grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-between border-r border-border-secondary bg-bg-backdrop p-2">
          <div className="flex flex-col gap-3">
            <RovingFocusGroup.Root orientation="vertical">
              <nav>
                <ul className="flex flex-col gap-2">
                  <li>
                    <NavLink to="/" aria-label="Notes" end>
                      {({ isActive }) => (isActive ? <NoteFillIcon24 /> : <NoteIcon24 />)}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={`/dates/${toDateString(new Date())}`} aria-label="Today" end>
                      {({ isActive }) =>
                        isActive ? (
                          <CalendarFillIcon24 date={new Date().getDate()} />
                        ) : (
                          <CalendarIcon24 date={new Date().getDate()} />
                        )
                      }
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/tags" aria-label="Tags" end>
                      {({ isActive }) => (isActive ? <TagFillIcon24 /> : <TagIcon24 />)}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/graph" aria-label="Graph" end>
                      {({ isActive }) => (isActive ? <GraphFillIcon24 /> : <GraphIcon24 />)}
                    </NavLink>
                  </li>
                </ul>
              </nav>
            </RovingFocusGroup.Root>
            <div role="none" className="mx-1 h-px bg-border-secondary" />
            <NewNoteDialog />
          </div>
          <div className="flex flex-col gap-2">
            <DropdownMenu modal={false}>
              <DropdownMenu.Trigger asChild>
                <IconButton aria-label="More actions" tooltipSide="right">
                  <MoreIcon24 />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content side="right" align="end">
                <DropdownMenu.Item
                  onClick={() =>
                    window.open("https://github.com/colebemis/lumen/issues/new", "_blank")
                  }
                >
                  Send feedback
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item onClick={() => send("RELOAD")}>Reload</DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => send("DISCONNECT")}>Disconnect</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </div>
        <main className="overflow-auto">
          <Outlet />
        </main>
      </div>
      {state.matches("connected.loadingNotes") ? (
        <Card
          elevation={1}
          className="fixed bottom-2 right-2 p-2 text-text-secondary"
          role="status"
          aria-label="Loading notes"
        >
          <LoadingIcon16 />
        </Card>
      ) : null}
    </div>
  )
}

function NavLink(props: NavLinkProps) {
  const path = useResolvedPath(props.to)
  const match = useMatch({
    path: path.pathname,
    end: props.end,
    caseSensitive: props.caseSensitive,
  })
  const isActive = match !== null

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <RovingFocusGroup.Item asChild active={isActive}>
          <RouterNavLink
            className={clsx(
              "flex rounded py-2 px-2 hover:bg-bg-secondary",
              isActive ? "text-text" : "text-text-secondary",
            )}
            {...props}
          />
        </RovingFocusGroup.Item>
      </Tooltip.Trigger>
      <Tooltip.Content side="right">{props["aria-label"]}</Tooltip.Content>
    </Tooltip>
  )
}
