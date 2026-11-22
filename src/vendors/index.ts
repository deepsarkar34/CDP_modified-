// Every product-specific term on screen comes from one of these packs.
// Neutral is the default story; the others relabel it for a prospect's stack.
// Vendor naming changes often: verify against current vendor docs before an important pitch.

export type VendorId = 'neutral' | 'salesforce' | 'adobe' | 'databricks';

export interface VendorPack {
  id: VendorId;
  label: string;
  zones: { sources: string; engineering: string; cdp: string; channels: string };
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
  email: string;
  crmRoute: string;
  media: string;
  realtime: string;
  personalization: string;
  cleanRoom: string;
  /** Steps that come from a partner rather than the core platform (composable stacks). */
  partners?: Partial<Record<'identity' | 'segment' | 'activation', string>>;
  note?: string;
}

export const VENDORS: Record<VendorId, VendorPack> = {
  neutral: {
    id: 'neutral',
    label: 'Vendor neutral',
    zones: { sources: 'Data sources', engineering: 'Data warehouse', cdp: 'Customer data platform', channels: 'Channels' },
    layers: { bronze: 'Raw layer', silver: 'Clean layer', gold: 'Mastered layer' },
    mdm: 'Master data management (MDM)',
    ingest: 'Zero-copy connection',
    dataModel: 'HCP data model',
    identity: 'Identity resolution',
    profile: 'Unified profile',
    insights: 'Calculated metrics',
    segment: 'Segment',
    publish: ['Scheduled batch', 'Fast refresh', 'Real time'],
    activation: 'Activation',
    email: 'Email platform',
    crmRoute: 'File drop or warehouse write-back to CRM',
    media: 'NPI list to HCP publishers; hashed emails for social',
    realtime: 'Event trigger rule',
    personalization: 'Personalization engine',
    cleanRoom: 'Data clean room',
  },
  salesforce: {
    id: 'salesforce',
    label: 'Salesforce',
    zones: { sources: 'Data sources', engineering: 'Snowflake', cdp: 'Salesforce Data 360', channels: 'Channels' },
    layers: { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' },
    mdm: 'MDM tool (Reltio, Informatica, Veeva OpenData) or Snowflake matching',
    ingest: 'Zero Copy from Snowflake',
    dataModel: 'Data Model Objects (DMOs)',
    identity: 'Identity Resolution ruleset',
    profile: 'Unified Individual',
    insights: 'Calculated Insights',
    segment: 'Segment',
    publish: ['Standard publish', 'Rapid publish', 'Real-time segment'],
    activation: 'Activation targets',
    email: 'Marketing Cloud (Journey Builder)',
    crmRoute: 'File storage (S3/SFTP) or Snowflake write-back; Veeva is not a native target',
    media: 'NPI list to Doximity, Medscape; hashed emails for Google, Meta, LinkedIn',
    realtime: 'Data Action → Flow, platform event or journey',
    personalization: 'Salesforce Personalization',
    cleanRoom: 'Data 360 Clean Rooms',
  },
  adobe: {
    id: 'adobe',
    label: 'Adobe',
    zones: { sources: 'Data sources', engineering: 'Your data warehouse', cdp: 'Adobe Real-Time CDP', channels: 'Channels' },
    layers: { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' },
    mdm: 'MDM tool (Reltio, Informatica, Veeva OpenData) or warehouse matching',
    ingest: 'Sources connectors, or Federated Audience Composition (zero copy)',
    dataModel: 'XDM schemas',
    identity: 'Identity Service (identity graph)',
    profile: 'Real-Time Customer Profile',
    insights: 'Computed attributes',
    segment: 'Audience',
    publish: ['Batch segmentation', 'Streaming segmentation', 'Edge segmentation'],
    activation: 'Destinations',
    email: 'Adobe Journey Optimizer',
    crmRoute: 'Cloud storage destination (S3/SFTP) to CRM load job',
    media: 'NPI list to HCP publishers; hashed emails to social destinations',
    realtime: 'Journey Optimizer event-triggered journey',
    personalization: 'Adobe Target / edge personalization',
    cleanRoom: 'Real-Time CDP Collaboration',
  },
  databricks: {
    id: 'databricks',
    label: 'Databricks',
    zones: { sources: 'Data sources', engineering: 'Databricks lakehouse', cdp: 'Composable CDP', channels: 'Channels' },
    layers: { bronze: 'Bronze (Delta)', silver: 'Silver (Delta)', gold: 'Gold (Delta)' },
    mdm: 'MDM partner or matching in Databricks, governed by Unity Catalog',
    ingest: 'Stays in the lakehouse: Unity Catalog, no copy',
    dataModel: 'Customer 360 gold tables',
    identity: 'Identity resolution partner (e.g. Amperity) or Databricks CustomerLake (preview)',
    profile: 'Customer 360 profile table',
    insights: 'SQL metrics and feature tables',
    segment: 'Audience (in Hightouch or Census)',
    publish: ['Scheduled sync', 'Frequent sync', 'Streaming events'],
    activation: 'Reverse ETL syncs',
    email: 'Email platform via reverse ETL',
    crmRoute: 'Reverse ETL sync or file drop to CRM',
    media: 'Reverse ETL audience syncs to publishers and ad platforms',
    realtime: 'Event streaming to a trigger in the email or CRM tool',
    personalization: 'Partner personalization engine',
    cleanRoom: 'Databricks Clean Rooms',
    partners: { identity: 'Partner', segment: 'Partner', activation: 'Partner' },
    note: 'Composable: the lakehouse holds the data; partners add identity, audiences and activation.',
  },
};

export const VENDOR_ORDER: VendorId[] = ['neutral', 'salesforce', 'adobe', 'databricks'];
