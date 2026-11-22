import { beforeEach, describe, expect, it } from 'vitest';
import { BEATS, STEPS, firstBeatOf } from './beats';
import { brownChannels, channelCounts, useDemo } from './store';
import { VENDORS, VENDOR_ORDER } from './vendors';
import scenario from './scenario/scenario.json';

beforeEach(() => useDemo.getState().reset());

describe('beat engine', () => {
  it('has nine steps in order, Decide between Segment and Activate', () => {
    expect(STEPS.map(s => s.id)).toEqual(['hook', 'capture', 'clean', 'master', 'resolve', 'segment', 'decide', 'activate', 'learn']);
    expect(BEATS).toHaveLength(STEPS.reduce((a, s) => a + s.notes.length, 0));
  });

  it('never moves past the first or last beat', () => {
    const s = useDemo.getState();
    s.prev();
    expect(useDemo.getState().beat).toBe(0);
    for (let i = 0; i < BEATS.length + 5; i++) useDemo.getState().next();
    expect(useDemo.getState().beat).toBe(BEATS.length - 1);
  });

  it('jumps to the first beat of a step and starts the timer', () => {
    useDemo.getState().jumpStep(3);
    const st = useDemo.getState();
    expect(st.beat).toBe(firstBeatOf(3));
    expect(BEATS[st.beat]).toMatchObject({ step: 3, local: 0 });
    expect(st.startedAt).not.toBeNull();
  });

  it('cycles through every vendor and back', () => {
    for (const id of VENDOR_ORDER.slice(1)) { useDemo.getState().cycleVendor(); expect(useDemo.getState().vendor).toBe(id); }
    useDemo.getState().cycleVendor();
    expect(useDemo.getState().vendor).toBe('neutral');
  });
});

describe('consent what-if', () => {
  it('only changes email reach', () => {
    const on = channelCounts(true), off = channelCounts(false);
    expect(on.email - off.email).toBe(1);
    expect({ ...off, email: on.email }).toEqual(on);
    expect(brownChannels(false)).toMatchObject({ email: false, crm: true, media: true, web: true });
  });

  it('segment funnel ends at 1,240 and channels never exceed it', () => {
    const rules = scenario.segment.rules;
    expect(rules[rules.length - 1][2]).toBe(1240);
    Object.values(channelCounts(true)).forEach(n => expect(n).toBeLessThanOrEqual(1240));
  });
});

describe('vendor packs', () => {
  it('fill every label for every vendor', () => {
    const keys = Object.keys(VENDORS.neutral).filter(k => !['partners', 'note'].includes(k));
    for (const id of VENDOR_ORDER) for (const k of keys) expect((VENDORS[id] as unknown as Record<string, unknown>)[k], `${id}.${k}`).toBeTruthy();
  });
});

describe('decision layer (illustrative numbers from the brief)', async () => {
  const d = await import('./decision');
  const opt = (id: string) => d.OPTIONS.find(o => o.id === id)!;

  it('lift = response - 15 and net value = lift x $2,000 - cost', () => {
    expect([d.lift(opt('call')), d.lift(opt('webinar')), d.lift(opt('none'))]).toEqual([19, 6, 0]);
    expect([d.netValue(opt('call')), d.netValue(opt('webinar')), d.netValue(opt('none'))]).toEqual([230, 115, 0]);
  });

  it('guardrails block the in-person visit and the dosing email', () => {
    expect(d.allowedOptions(true).map(o => o.id)).toEqual(['call', 'webinar', 'none']);
    expect(d.blockedReasons(opt('webinar'), false)).toContain('No email consent');
  });

  it('chooses the remote call with ML and the webinar with rules only', () => {
    expect(d.chooseAction('ml', true).id).toBe('call');
    expect(d.chooseAction('rules', true).id).toBe('webinar');
    expect(d.chooseAction('rules', false).id).toBe('call');
    expect(d.decisionFor('ml', true).label).toBe('Remote call within 5 days');
  });

  it('ranks capacity by lift with ML and by propensity with rules only', () => {
    const ml = d.rankCapacity('ml'), rules = d.rankCapacity('rules');
    expect(ml.thisWeek.map(r => r.name)).toEqual(['Dr. Brown', 'Dr. Okafor', 'Dr. Shah', 'Dr. Rivera', 'Dr. Chen', 'Dr. Kim']);
    expect([ml.rankOf('Dr. Brown'), ml.rankOf('Dr. Patel')]).toEqual([1, 8]);
    expect([rules.rankOf('Dr. Patel'), rules.rankOf('Dr. Brown')]).toEqual([1, 7]);
    expect(rules.nextWeek.map(r => r.name)).toEqual(['Dr. Brown', 'Dr. Shah']);
  });

  it('only sublayers 1 and 5 run in rules only', () => {
    expect(d.playOrder('rules')).toEqual([1, 5]);
    expect(d.playOrder('ml')).toEqual([1, 2, 3, 4, 5]);
  });
});
