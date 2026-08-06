const col = "flex flex-col gap-2.5";
const link =
  "cursor-pointer border-none bg-transparent p-0 text-left font-ui text-body-sm text-fg-muted no-underline hover:text-fg-body transition-colors duration-[140ms] ease-standard";
const head = "font-mono text-micro uppercase tracking-label text-fg-faint mb-1";

export function Footer() {
  return (
    <footer className="border-t border-line-subtle px-5 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-[2fr_1fr_1fr_1fr] sm:gap-10">
        <div className="col-span-2 sm:col-span-1">
          <div className="mb-2.5 font-display text-h4 font-bold tracking-heading text-fg-strong">
            dropbase<span className="text-brand">.</span>
          </div>
          <p className="max-w-[260px] font-ui text-body-sm leading-normal text-fg-faint">
            Graded DJ trading cards for people who take the crate seriously.
          </p>
        </div>
        <nav aria-label="Catalog" className={col}>
          <span className={head}>Catalog</span>
          <button type="button" className={link}>
            New drops
          </button>
          <button type="button" className={link}>
            By genre
          </button>
          <button type="button" className={link}>
            Legendary foils
          </button>
        </nav>
        <nav aria-label="Company" className={col}>
          <span className={head}>Company</span>
          <button type="button" className={link}>
            Grading
          </button>
          <button type="button" className={link}>
            Journal
          </button>
          <button type="button" className={link}>
            Careers
          </button>
        </nav>
        <nav aria-label="Follow" className={col}>
          <span className={head}>Follow</span>
          <button type="button" className={link}>
            Instagram
          </button>
          <button type="button" className={link}>
            SoundCloud
          </button>
          <button type="button" className={link}>
            Discord
          </button>
        </nav>
      </div>
      <div className="mx-auto mt-9 flex max-w-[1200px] flex-col gap-1 border-t border-line-subtle pt-5 font-mono text-micro text-fg-faint sm:flex-row sm:justify-between sm:gap-0">
        <span>© 2026 Dropbase</span>
        <span>Terms · Privacy</span>
      </div>
    </footer>
  );
}
