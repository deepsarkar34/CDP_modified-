import { AnimatePresence, motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/** Renders "Text with *one word* highlighted" with the brand gradient on the starred part. */
export function GradText({ text }: { text: string }) {
  return <>{text.split(/(\*[^*]+\*)/).map((p, i) => p.startsWith('*') ? <span key={i} className="g">{p.slice(1, -1)}</span> : <Fragment key={i}>{p}</Fragment>)}</>;
}

export function Head({ title, sub, meta }: { title: string; sub?: ReactNode; meta?: ReactNode }) {
  return (
    <div className="head">
      <div>
        <h2><GradText text={title} /></h2>
        {sub && <p className="sub">{sub}</p>}
      </div>
      {meta && <div className="meta">{meta}</div>}
    </div>
  );
}

/** A product-style window with a title bar. */
export function Win({ name, right, children, className = '', style, flush }: { name: ReactNode; right?: ReactNode; children: ReactNode; className?: string; style?: CSSProperties; flush?: boolean }) {
  return (
    <div className={`win ${className}`} style={style}>
      <div className="win-bar"><span className="name">{name}</span>{right && <span className="right">{right}</span>}</div>
      <div className="win-body" style={flush ? { padding: 0 } : undefined}>{children}</div>
    </div>
  );
}

/** Technical layer revealed with the D key. */
export function DeepDive({ show, title, children }: { show: boolean; title: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.section
          ref={ref}
          className="deep"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
          onAnimationComplete={def => { if ((def as { opacity?: number })?.opacity === 1) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }}
        >
          <span className="label">Technical detail: {title}</span>
          {children}
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/** Fades content in once its beat is reached; reserves space so the layout does not jump. */
export function Reveal({ when, children, delay = 0, y = 10 }: { when: boolean; children: ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={false} animate={when ? { opacity: 1, y: 0 } : { opacity: 0, y }} transition={{ duration: 0.4, delay: when ? delay : 0 }} style={{ pointerEvents: when ? 'auto' : 'none' }} aria-hidden={!when}>
      {children}
    </motion.div>
  );
}

export function Counter({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, n => Math.round(n).toLocaleString('en-US'));
  useEffect(() => { const c = animate(mv, value, { duration: 0.8, ease: 'easeOut' }); return () => c.stop(); }, [value, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}
