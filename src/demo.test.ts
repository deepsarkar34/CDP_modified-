import { beforeEach, describe, expect, it } from 'vitest';
import { BEATS, STEPS, firstBeatOf } from './beats';
import { channelCounts, useDemo } from './store';
import scenario from './scenario/scenario.json';
import { allowedOptions, blockedReasons, chooseAction, playOrder, OPTIONS } from './decision';

beforeEach(() => useDemo.getState().reset());

describe('beat engine', () => {
  it('has ten steps in the order of the Dr. Ortiz story', () => {
    expect(STEPS.map(s => s.id)).toEqual(['hook', 'capture', 'clean', 'master', 'ai', 'resolve', 'audiences', 'decide', 'activate', 'learn']);
    expect(BEATS).toHaveLength(STEPS.reduce((a, s) => a + s.notes.length, 0));
  });

  it('never moves past the first or last beat', () => {
    useDemo.getState().prev();
    expect(useDemo.getState().beat).toBe(0);
    for (let i = 0; i < BEATS.length + 5; i++) useDemo.getState().next();
    expect(useDemo.getState().beat).toBe(BEATS.length - 1);
  });

  it('jumps to the first beat of a step', () => {
    useDemo.getState().jumpStep(7);
    expect(BEATS[useDemo.getState().beat]).toMatchObject({ step: 7, local: 0 });
    expect(firstBeatOf(9)).toBeGreaterThan(0);
  });
});

describe('scenario numbers (illustrative, from the brief)', () => {
  it('opens with six fragments, one per system, and eight records in six systems', () => {
    expect(scenario.hookFragments).toHaveLength(6);
    expect(new Set(scenario.hookFragments.map(f => f[0])).size).toBe(6);
    expect(scenario.sources).toHaveLength(6);
    expect(scenario.sources.reduce((a, s) => a + s.records, 0)).toBe(8);
  });

  it('builds Side effect priority from 4,120 down to 342', () => {
    expect(scenario.audience.build.map(r => r[1])).toEqual([4120, 1030, 386, 342]);
  });

  it('never reaches more oncologists in a channel than are in the segment', () => {
    Object.values(channelCounts(true)).forEach(n => expect(n).toBeLessThanOrEqual(342));
    expect(channelCounts(true).email - channelCounts(false).email).toBe(1);
  });

  it('holds back 34 of 342 and shows a 19-point lift', () => {
    expect(Math.round(342 * scenario.learn.holdoutShare)).toBe(34);
    expect(scenario.learn.engagedContacted - scenario.learn.engagedHoldout).toBe(19);
  });
});

describe('decision layer: two passes', () => {
  it('pass 1 blocks the efficacy email and MSL outreach', () => {
    expect(allowedOptions(true).map(o => o.id)).toEqual(['guide', 'visit', 'webinar']);
  });

  it('rules plus ML picks the side effect guide email (34%), rules only picks the webinar (priority 1)', () => {
    expect(chooseAction('ml', true).id).toBe('guide');
    expect(chooseAction('rules', true).id).toBe('webinar');
  });

  it('with email consent off, both modes fall back to the rep visit', () => {
    expect(blockedReasons(OPTIONS.find(o => o.id === 'guide')!, false)).toContain('No email consent');
    expect(chooseAction('ml', false).id).toBe('visit');
    expect(chooseAction('rules', false).id).toBe('visit');
  });

  it('rules only skips pass 2', () => {
    expect(playOrder('rules')).toEqual([1]);
    expect(playOrder('ml')).toEqual([1, 2]);
  });
});
