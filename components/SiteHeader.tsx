"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const menu = [
  { label: "Discover", links: [["Directory", "/directory"], ["All categories", "/categories"], ["Collections", "/collections"], ["Workflow Lab", "/workflows"], ["Industry playbooks", "/playbooks"]] },
  { label: "Decide", links: [["Find my stack", "/#stack-finder"], ["Compare", "/compare"], ["Stack coverage", "/compatibility"], ["Connections", "/integrations"], ["Current offers", "/deals"]] },
  { label: "Trust", links: [["How we evaluate", "/about"], ["Disclosures", "/disclosures"], ["Suggest a provider", "/submit"]] }
];
export function SiteHeader() {
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const root = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const close = () => { setOpen(null); setMobile(false); };
  useEffect(() => { const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(); }; document.addEventListener("pointerdown", outside); return () => document.removeEventListener("pointerdown", outside); }, []);
  return <header className="site-header" ref={root} onKeyDown={event => { if (event.key === "Escape") { (mobile ? toggle.current : open === null ? null : buttons.current[open])?.focus(); close(); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
    <div className="utility"><div className="wrap"><span>TOOLS AND SERVICES FOR BUSINESS</span><span>COMPARE WITH CONTEXT.</span></div></div>
    <div className="wrap header-main"><Link href="/" className="brand" onClick={close} aria-label="Distilled Marketplace home"><b className="brand-mark">dm</b><span>DISTILLED<small>MARKETPLACE</small></span></Link>
      <nav id="primary-navigation" className={`nav ${mobile ? "nav-open" : ""}`} aria-label="Primary navigation">{menu.map((group, index) => <div className="nav-group" key={group.label}><button ref={node => { buttons.current[index] = node; }} type="button" aria-expanded={open === index} aria-controls={`menu-${index}`} onClick={() => setOpen(open === index ? null : index)}>{group.label}<span aria-hidden="true">{open === index ? "−" : "+"}</span></button><div className="mega" id={`menu-${index}`} hidden={open !== index}><div className="wrap mega-inner"><div><span className="eyebrow">{group.label.toUpperCase()} / SERVICE EXCHANGE</span><strong>{group.label === "Discover" ? "Start with the service need." : group.label === "Decide" ? "Use evidence before selection." : "See how this directory works."}</strong></div><ul>{group.links.map(([label, href]) => <li key={href}><Link href={href} onClick={close}>{label}<span aria-hidden="true">↗</span></Link></li>)}</ul></div></div></div>)}</nav>
      <Link className="button button-orange header-action" href="/directory" onClick={close}>Open directory <span aria-hidden="true">↗</span></Link>
      <button className="mobile-toggle" ref={toggle} type="button" aria-expanded={mobile} aria-controls="primary-navigation" aria-label={mobile ? "Close navigation" : "Open navigation"} onClick={() => { setMobile(!mobile); setOpen(null); }}>{mobile ? "×" : "☰"}</button>
    </div></header>;
}
