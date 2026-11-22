// The demo script. Each beat is one press of →. Stages render from their local beat index.

export type StepId = 'hook' | 'capture' | 'clean' | 'master' | 'ai' | 'resolve' | 'audiences' | 'decide' | 'activate' | 'learn';

export interface StepDef {
  id: StepId;
  title: string;
  sub: string;
  zone: 'sources' | 'engineering' | 'cdp' | 'decision' | 'channels';
  /** Presenter notes, one per beat. Length defines the number of beats in the step. */
  notes: string[];
}

export const STEPS: StepDef[] = [
  {
    id: 'hook', title: 'Question', sub: 'One or six?', zone: 'sources',
    notes: [
      'Ask the room whether this is one oncologist or six. Each fragment comes from a different system: Veeva, IQVIA, claims, SFMC, the HCP website and OneKey.',
      'It is one person: Dr. Lena Ortiz, a medical oncologist in Houston. We will follow her through Snowflake, Data 360, a decided next action, the channels and the learning loop.',
    ],
  },
  {
    id: 'capture', title: 'Capture', sub: 'Raw sources', zone: 'sources',
    notes: [
      'Six systems each know a piece of her. Each sends its own version, in its own format, on its own schedule.',
      'Eight records across six systems. Batch data lands in Snowflake through Openflow connectors. Web behaviour that needs action within minutes also streams straight into Data 360.',
      'Pink fields disagree with another source. The blue ones are patient tokens: claims and EHR data arrive already de-identified by the vendor and matter to her only because they carry her NPI. Note the call note in Veeva; it comes back in the AI step.',
    ],
  },
  {
    id: 'clean', title: 'Clean', sub: 'Bronze to silver', zone: 'engineering',
    notes: [
      'This is bronze, exactly as received. Nothing can be matched on it yet.',
      'Silver standardizes each field: name parts, one specialty list, postal address, one date format, lowercase email.',
      'Duplicates inside a source go: two Veeva records become one, two SFMC contacts become one.',
      'Patient tokens are swapped into the company\'s own token space and quality checks run. Snowpark and dynamic tables run these rules on every refresh, and Cortex Code can help engineers write them. This is classic data engineering, and it belongs here, before anything reaches Data 360.',
    ],
  },
  {
    id: 'master', title: 'Master', sub: 'Gold layer', zone: 'engineering',
    notes: [
      'Five clean silver sources, still separate. Are they one real oncologist?',
      'Matching logic in Snowflake, checked against OneKey reference data, merges them. Each field keeps the source it came from.',
      'She gets one golden ID, HCP-00731. Mastering happens once, here. Data 360 receives this ID and never re-decides it. Patient tokens only add counts to her record.',
    ],
  },
  {
    id: 'ai', title: 'AI and ML', sub: 'Snowflake ML and Cortex', zone: 'engineering',
    notes: [
      'Snowflake is more than storage. The data science team scores every oncologist weekly with Snowflake ML: is she likely to start a new patient in the next 90 days? She scores 0.81, top 12 percent. These are the reasons the model gives.',
      'Cortex AI reads rep call notes every night. Her rep wrote that she asked about rash and colitis with immunotherapy and wants something for her infusion nurses. Cortex turns that into data: topic side effect management, audience infusion nurses.',
      'Snowflake Intelligence lets analysts ask in plain English, answered with governed SQL. It finds 38 oncologists. It does not send anything, check consent or react when one of them clicks. That is the job of Data 360. All three tables reach Data 360 through Zero Copy.',
    ],
  },
  {
    id: 'resolve', title: 'Resolve', sub: 'Identity and profile', zone: 'cdp',
    notes: [
      'Data 360 reads the gold record, the score and the call note topic through Zero Copy, maps them to the Salesforce data model and starts her unified profile.',
      'It links every known way she shows up: email, SFMC subscriber key, Veeva CRM ID.',
      'On Day 1 she downloaded the efficacy summary on the website, anonymously. That visit sits on an unknown device.',
      'On Day 3 she clicks a tracked link in an email. The device joins her profile and the Day 1 download counts for her. Snowflake decided who she is; Data 360 recognizes her across email, CRM and web. Interests are insights built on top.',
    ],
  },
  {
    id: 'audiences', title: 'Audiences', sub: 'Two use cases', zone: 'cdp',
    notes: [
      'Use case one: Priya, a brand manager, builds Side effect priority herself in about five minutes. It used to take a data request and a change order. It combines the Snowflake score, the Cortex topic and web behaviour. 342 oncologists. Consent is checked per channel at activation.',
      'Use case two: on Day 17 at 10:14 she downloads the side effect guide. Two minutes later she is in the real-time audience. Snowflake alone would know tomorrow, after the nightly batch. Two signals now agree: the call note and her own download. The event asks the decision layer what to do next.',
    ],
  },
  {
    id: 'decide', title: 'Decide', sub: 'Next best action', zone: 'decision',
    notes: [
      'Two passes, in this order. Rules remove what the brand is not allowed to do: here the efficacy email she already has, and MSL outreach without a medical information request. Then machine learning ranks what is left by how likely she is to engage. Press M to compare Rules only.',
      'With the model: the side effect guide email today, then the rep alert, the visit and the webinar, and a pause if she does not engage. An Agentforce agent writes the rep\'s reason; the language model explains, it never decides. Rules only sends the webinar invite: allowed, but not what she just asked for. There is no decision engine today: rules run in Flow, the model runs in Snowflake.',
    ],
  },
  {
    id: 'activate', title: 'Activate', sub: 'Push and pull', zone: 'channels',
    notes: [
      'Push channels receive a list from Data 360. Pull channels ask about one person when she shows up. Click a band to show the route and the steps.',
      'What she actually sees: the email from the oncology brand team, her rep Marcus Lee\'s alert, a publisher placement and a personalized website.',
      'The real-time path: download at 10:14, the event streams in within seconds, the rule checks score and consent, the decision runs and the email goes at 10:42. The rep alert appears the same day.',
      'One story across channels: side effect support first, the nurse webinar next. Nothing sends efficacy content she already has.',
    ],
  },
  {
    id: 'learn', title: 'Learn', sub: 'Feedback and proof', zone: 'channels',
    notes: [
      'Click each outcome. What she does next changes what the brand does for her next week. The model learns at its next retrain; the rules learn the same day.',
      'Results flow back from every channel and are shared back to Snowflake through Zero Copy, where the models retrain.',
      'To prove it works, hold back 10 percent of Side effect priority, 34 oncologists, from every action. After 90 days, 31 percent of contacted oncologists engaged versus 12 percent of the holdout: 19 points caused by the program. Snowflake thinks across all oncologists; Data 360 acts on one, at the right moment, with consent checked.',
    ],
  },
];

export interface Beat { step: number; local: number; note: string }

export const BEATS: Beat[] = STEPS.flatMap((s, step) => s.notes.map((note, local) => ({ step, local, note })));

export const firstBeatOf = (step: number) => BEATS.findIndex(b => b.step === step);

export const clampBeat = (i: number) => Math.max(0, Math.min(BEATS.length - 1, i));

/** Target talk time in seconds (used by the presenter timer). */
export const TARGET_SECONDS = 18 * 60;
