export function Keys({ keys }: { keys: string[] }) {
  return (
    <div className="-m-1 flex items-center gap-[0.125rem]">
      {keys.map((key) => (
        <kbd
          key={key}
          className="min-w-[1.375rem] rounded bg-bg-tertiary p-1 text-center font-body leading-none text-text-secondary shadow-[inset_0_-0.0625rem_0_var(--color-border-secondary)] dark:shadow-[inset_0_0.0625rem_0_var(--color-border-secondary)]"
        >
          {key}
        </kbd>
      ))}
    </div>
  )
}
