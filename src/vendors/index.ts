// This version tells one stack: Snowflake plus Salesforce Data 360.
// The platform switch from the Dr. Brown demo is removed; every product term lives here.

export type VendorId = 'salesforce';

export interface VendorPack {
  id: VendorId;
  label: string;
  zones: { sources: string; engineering: string; cdp: string; decision: string; channels: string };
  layers: { bronze: string; silver: string; gold: string };
  mdm: string;
  ingest: string;
  dataModel: string;
  identity: string;
  profile: string;
  insights: string;
  segment: string;
  publish: [string, string, string];
  activation: string;
  partners?: Partial<Record<'identity' | 'segment' | 'activation', string>>;
}

export const VENDORS: Record<VendorId, VendorPack> = {
  salesforce: {
    id: 'salesforce',
    label: 'Snowflake and Salesforce Data 360',
    zones: { sources: 'Data sources', engineering: 'Snowflake: engineering and AI', cdp: 'Salesforce Data 360', decision: 'Decision layer', channels: 'Channels and learning' },
    layers: { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' },
    mdm: 'Matching logic in Snowflake, checked against OneKey',
    ingest: 'Zero Copy from Snowflake',
    dataModel: 'Salesforce data model (Data Model Objects)',
    identity: 'Identity Resolution ruleset',
    profile: 'Unified profile',
    insights: 'Calculated Insights',
    segment: 'Segment',
    publish: ['Standard publish', 'Rapid publish', 'Real-time segment'],
    activation: 'Activation targets',
  },
};

export const VENDOR_ORDER: VendorId[] = ['salesforce'];
