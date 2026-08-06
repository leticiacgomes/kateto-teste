const col = "flex flex-col gap-2.5";
const link = "font-ui text-body-sm text-fg-muted no-underline cursor-pointer";
const head = "font-mono text-micro uppercase tracking-label text-fg-faint mb-1";

export function Footer() {
  return (
    <footer className="border-t border-line-subtle px-10 pt-12 pb-10">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[2fr_1fr_1fr_1fr] gap-10">
        <div>
          <div className="mb-2.5 font-display text-[22px] font-bold tracking-[-0.04em] text-fg-strong">
            dropbase<span className="text-brand">.</span>
          </div>
          <p className="max-w-[260px] font-ui text-body-sm leading-normal text-fg-faint">
            Graded DJ trading cards for people who take the crate seriously.
          </p>
        </div>
        <div className={col}>
          <span className={head}>Catalog</span>
          <span className={link}>New drops</span>
          <span className={link}>By genre</span>
          <span className={link}>Legendary foils</span>
        </div>
        <div className={col}>
          <span className={head}>Company</span>
          <span className={link}>Grading</span>
          <span className={link}>Journal</span>
          <span className={link}>Careers</span>
        </div>
        <div className={col}>
          <span className={head}>Follow</span>
          <span className={link}>Instagram</span>
          <span className={link}>SoundCloud</span>
          <span className={link}>Discord</span>
        </div>
      </div>
      <div className="mx-auto mt-9 flex max-w-[1200px] justify-between border-t border-line-subtle pt-5 font-mono text-micro text-fg-faint">
        <span>© 2026 Dropbase</span>
        <span>Terms · Privacy</span>
      </div>
    </footer>
  );
}
