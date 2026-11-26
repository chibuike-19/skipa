// Component gallery: every packages/ui component and state, in the brand chosen with ?brand=
// (skipa | adunni | harbour). Playwright screenshots each section in all three modes (e2e/).
// Sample content is the canvas's (05 Components); in the apps all copy comes from i18n/en.ts.
import './gallery.css';

import { StrictMode, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import {
  Avatar,
  AVATARS,
  BranchMenu,
  BrandScope,
  Breadcrumbs,
  Button,
  Checkbox,
  ColourField,
  ConfirmDialog,
  Feedback,
  HoldButton,
  Icon,
  GLYPHS,
  Kpi,
  LogoUpload,
  Mark,
  NavTabs,
  OtpField,
  Pagination,
  ProgressBar,
  RadioGroup,
  Segmented,
  SelectField,
  Sheet,
  SidePanel,
  Sidebar,
  SkeletonRows,
  SkeletonTable,
  SkipaHeader,
  Spinner,
  State,
  StatusChip,
  STATUSES,
  StepBar,
  Stepper,
  StoreHeader,
  TabBar,
  Table,
  Tabs,
  TextArea,
  TextField,
  Toggle,
  Tooltip,
  TooltipProvider,
  TopBar,
  Wordmark,
  type AvatarId,
  type ButtonVariant,
  type FeedbackKind,
  type FeedbackTone,
  type Glyph,
  type Status,
} from '../src/index.ts';

const BRANDS = ['skipa', 'adunni', 'harbour'] as const;
type Brand = (typeof BRANDS)[number];
const param = new URLSearchParams(location.search).get('brand');
const brand: Brand = (BRANDS as readonly string[]).includes(param ?? '')
  ? (param as Brand)
  : 'skipa';
const STORE = {
  skipa: { name: 'Bode’s Supermarket', logo: null },
  adunni: { name: 'Adunni Mart', logo: '/brands/adunni-wide-white.svg' },
  harbour: { name: 'Harbour Grocers', logo: '/brands/harbour-wide-white.svg' },
}[brand];
const noop = () => undefined;

function Section({
  id,
  title,
  children,
  wide = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section
      data-testid={`section-${id}`}
      aria-labelledby={`h-${id}`}
      className={
        wide
          ? 'flex flex-col gap-4 rounded-lg bg-surface p-5'
          : 'flex max-w-[480px] flex-col gap-4 rounded-lg bg-surface p-5'
      }
    >
      <h2 id={`h-${id}`} className="t-d-h3 m-0">
        {title}
      </h2>
      {children}
    </section>
  );
}

const Row = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-3">{children}</div>
);

const VARIANTS: [ButtonVariant, string][] = [
  ['primary', 'Pay ₦31,300'],
  ['secondary', 'Add item'],
  ['tertiary', 'Cancel'],
  ['link', 'See receipt'],
  ['destructive', 'Switch off'],
  ['success', 'All match'],
  ['pay', 'Try again'],
  ['inverse', 'Type barcode'],
];

function Buttons() {
  return (
    <Section id="buttons" title="Button" wide>
      {VARIANTS.map(([v, label]) => (
        <div
          key={v}
          className={
            v === 'inverse'
              ? 'flex flex-wrap items-center gap-3 rounded-md bg-inverse p-3'
              : 'flex flex-wrap items-center gap-3'
          }
        >
          <code
            className={v === 'inverse' ? 't-d-label w-[96px] text-inverse' : 't-d-label w-[96px]'}
          >
            {v}
          </code>
          <Button variant={v} size="md" label={label} />
          <Button variant={v} size="md" label={label} disabled />
          <Button variant={v} size="md" label={label} loading />
        </div>
      ))}
      <Row>
        <Button size="lg" label="Large 56" />
        <Button size="md" label="Medium 48" />
        <Button size="sm" label="Small 40" />
        <Button variant="secondary" size="md" icon="download" label="Export CSV" />
        <Button variant="tertiary" size="md" iconRight="arrow-right" label="See all" />
        <Button variant="secondary" size="lg" icon="scan" iconOnly label="Scan another item" />
        <Button variant="tertiary" size="md" icon="close" iconOnly label="Close" />
      </Row>
    </Section>
  );
}

function Chips() {
  return (
    <Section id="status-chips" title="StatusChip" wide>
      <Row>
        {(Object.keys(STATUSES) as Status[]).map((s) => (
          <StatusChip key={s} status={s} />
        ))}
      </Row>
      <Row>
        <StatusChip status="paid" size="sm" />
        <StatusChip status="pending" size="sm" />
        <StatusChip status="synced" size="sm" label="Synced 2 min ago" />
      </Row>
    </Section>
  );
}

function Fields() {
  const [otp, setOtp] = useState('4821');
  return (
    <Section id="fields" title="Field">
      <TextField label="Your name" placeholder="e.g. Ngozi Adeyemi" />
      <TextField
        kind="phone"
        label="Phone number"
        defaultValue="803 123 4567"
        hint="We’ll text you a code. No spam."
      />
      <TextField
        kind="phone"
        label="Phone number"
        defaultValue="803 12"
        error="Enter a Nigerian mobile number, like 803 123 4567."
      />
      <TextField kind="email" label="Email" optional placeholder="you@example.com" />
      <OtpField
        label="Enter the 6-digit code"
        value={otp}
        onChange={setOtp}
        hint="Sent to +234 803 123 4567. Resend in 0:42"
      />
      <OtpField
        label="Enter the 6-digit code"
        value="482913"
        onChange={noop}
        error="That code isn’t right. Check and try again."
      />
      <TextField
        kind="search"
        label="Search receipts"
        placeholder="Receipt number, phone or amount"
      />
      <TextField kind="number" label="Barcode number" defaultValue="6151100054321" disabled />
      <SelectField label="Branch" defaultValue="lk">
        <option value="lk">Lekki Phase 1</option>
        <option value="ik">Ikeja GRA</option>
      </SelectField>
      <TextArea label="What went wrong?" placeholder="Tell the store in a sentence or two" />
    </Section>
  );
}

function Controls() {
  const [agree, setAgree] = useState(true);
  const [emails, setEmails] = useState(true);
  const [method, setMethod] = useState('card');
  const [qty, setQty] = useState(2);
  return (
    <Section id="controls" title="Control">
      <Checkbox label="I agree to the privacy notice" checked={agree} onCheckedChange={setAgree} />
      <Checkbox
        label="Send me offers from Adunni Mart"
        description="You can change this any time in Profile."
        checked={false}
        onCheckedChange={noop}
      />
      <Checkbox
        label="I agree to the privacy notice"
        checked={false}
        onCheckedChange={noop}
        disabled
      />
      <RadioGroup
        label="How do you want to pay?"
        value={method}
        onValueChange={setMethod}
        options={[
          { value: 'card', label: 'Card', description: 'Visa, Mastercard, Verve' },
          { value: 'transfer', label: 'Bank transfer' },
          { value: 'ussd', label: 'USSD', disabled: true },
        ]}
      />
      <Toggle
        label="Email my receipts"
        description="We’ll email every receipt to you."
        checked={emails}
        onCheckedChange={setEmails}
      />
      <Toggle label="Email my receipts" checked={false} onCheckedChange={noop} disabled />
      <Row>
        <Stepper value={qty} onChange={setQty} />
        <Stepper value={1} onChange={noop} />
        <Stepper value={30} onChange={noop} atMax />
      </Row>
    </Section>
  );
}

const TONES: FeedbackTone[] = ['success', 'pending', 'warning', 'error', 'info', 'neutral'];
const FEEDBACK: Record<FeedbackKind, Record<FeedbackTone, [string, string?, string?]>> = {
  toast: {
    success: ['Added to cart', 'Evaporated milk 160 g · ₦650', 'Undo'],
    pending: ['Sending…'],
    warning: ['Price updated', 'Vegetable oil is now ₦3,450'],
    error: ['Couldn’t remove item', 'Try again', 'Retry'],
    info: ['Receipt sent by email', 'To a***@mail.example'],
    neutral: ['Copied'],
  },
  alert: {
    success: ['Refund approved', 'The store will pay you back directly.'],
    pending: ['Waiting for head office', 'Refunds over ₦20,000 need a second approval.'],
    warning: [
      '12 products are missing a weight',
      'They stay hidden from shoppers until you add one.',
      'Add weights',
    ],
    error: [
      'That code has expired',
      'Codes last 10 minutes. We can send a new one.',
      'Send a new code',
    ],
    info: ['Prices refresh every 5 minutes', 'Last synced from your POS at 14:31.'],
    neutral: ['Tip', 'Hold the barcode flat and in good light.'],
  },
  banner: {
    success: ['Back online', 'Your cart is synced.'],
    pending: ['Confirming 2 payments'],
    warning: [
      'Skipa is switched off at this branch',
      'Please pay at the tills. Payments already started can finish.',
    ],
    error: [
      'POS sync failing for 42 min',
      'Sales are queued and will post when it’s back. Head office alerted.',
      'View sync log',
    ],
    info: ['You’re offline', 'Scanning still works. Pay needs a connection.'],
    neutral: ['Viewing as Adunni Mart', 'Read only. Every view is logged.'],
  },
};

function Feedbacks() {
  return (
    <Section id="feedback" title="Feedback" wide>
      {(['toast', 'alert', 'banner'] as FeedbackKind[]).map((kind) => (
        <div
          key={kind}
          className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(328px,1fr))]"
        >
          {TONES.map((tone) => {
            const [title, body, action] = FEEDBACK[kind][tone];
            return (
              <Feedback
                key={tone}
                kind={kind}
                tone={tone}
                title={title}
                body={body}
                action={action === undefined ? undefined : { label: action, onClick: noop }}
                onDismiss={kind === 'alert' && action === undefined ? noop : undefined}
              />
            );
          })}
        </div>
      ))}
    </Section>
  );
}

function Loadings() {
  return (
    <Section id="loading" title="Loading">
      <ProgressBar
        value={72}
        label="Loading Adunni Mart’s products"
        caption="1,284 products · once loaded, scanning works without data"
      />
      <StepBar label="Registration progress" step={2} caption="Step 2 of 3 · Check your phone" />
      <Spinner label="Checking prices…" />
      <SkeletonRows label="Loading your cart…" />
      <SkeletonTable label="Loading receipts" />
    </Section>
  );
}

function States() {
  return (
    <Section id="states" title="State" wide>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(360px,1fr))]">
        <State
          art="basket"
          title="Your cart is empty"
          body="Scan the barcode on anything from drinks, snacks, packaged food or household. It appears here in a second."
          action={{ label: 'Start scanning', icon: 'scan', onClick: noop }}
        />
        <State
          art="receipt"
          title="No receipts yet"
          body="After your first Skipa visit, every receipt from every store lives here."
        />
        <State
          art="inbox"
          title="No open tickets"
          body="Nice. New shopper messages for Lekki Phase 1 appear here with their order details attached."
        />
        <State
          art="receipt"
          title="No receipts match “SKP-LK-0999”"
          body="Check the number, or search by phone number or amount instead."
          action={{ label: 'Clear search', variant: 'secondary', icon: 'close', onClick: noop }}
        />
        <State
          art="error"
          title="Something went wrong on our side"
          body="Your cart is safe on this phone. Try again; if it keeps happening, tell the store this reference."
          reference={{ label: 'Reference', requestId: '91c0-44ad', code: 'SYS-500' }}
          action={{ label: 'Try again', icon: 'refresh', onClick: noop }}
        />
        <State
          art="off"
          title="Skipa is off at this branch right now"
          body="Please pay at the tills today. Your items are still on the shelf, nothing was charged."
        />
      </div>
    </Section>
  );
}

function Headers() {
  return (
    <Section id="headers" title="SkipaHeader · StoreHeader · TabBar">
      <div className="flex w-[360px] flex-col gap-3">
        <SkipaHeader avatar={{ id: 'tomi', onClick: noop }} />
        <SkipaHeader title="Your receipts" onBack={noop} onHelp={noop} />
        <StoreHeader storeName={STORE.name} logoUrl={STORE.logo} onHelp={noop} />
        <StoreHeader
          storeName={STORE.name}
          logoUrl={STORE.logo}
          branch="Lekki Phase 1"
          onSwitchStore={noop}
          onHelp={noop}
        />
        <StoreHeader storeName={STORE.name} logoUrl={null} onBack={noop} onHelp={noop} />
        <StoreHeader storeName={STORE.name} logoUrl={null} variant="pay" onHelp={noop} />
        <TabBar
          active="home"
          items={[
            { id: 'home', href: '#home', label: 'Home' },
            { id: 'stores', href: '#stores', label: 'Stores' },
            {
              id: 'support',
              href: '#support',
              label: 'Support',
              badge: { count: 1, label: '1 new reply' },
            },
            { id: 'profile', href: '#profile', label: 'Profile' },
          ]}
        />
      </div>
    </Section>
  );
}

const STORE_NAV = [
  ['live', 'Live view'],
  ['receipt', 'Receipts'],
  ['exit', 'Exit checks', 1, true],
  ['refund', 'Refunds and disputes', 2],
  ['chat', 'Support inbox', 3],
  ['chart', 'Analytics'],
  ['check-circle', 'Reconciliation'],
  ['tag', 'Catalogue'],
  ['star', 'Shoppers and stars'],
  ['help', 'FAQs'],
  ['user', 'Staff'],
  ['store', 'Branding'],
  ['settings', 'Settings'],
  ['lock', 'Data and privacy'],
] as const;

function Dashboard() {
  const [tab, setTab] = useState('decide');
  const [range, setRange] = useState('7d');
  const [page, setPage] = useState(1);
  const items = STORE_NAV.map(([glyph, label, count, urgent]) => ({
    href: `#${label}`,
    label,
    glyph,
    count,
    urgent,
  }));
  return (
    <Section id="dashboard" title="DashNav · NavBits · KPI" wide>
      <div className="flex gap-4">
        <div className="h-[760px]">
          <Sidebar
            label="Store dashboard"
            product="for Adunni Mart"
            items={items}
            currentHref="#Live view"
          />
        </div>
        <div className="h-[760px]">
          <Sidebar
            label="Store dashboard"
            product="for Adunni Mart"
            items={items}
            currentHref="#Receipts"
            compact
          />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <TopBar
            branch={{ name: 'Lekki Phase 1', open: false, onOpen: noop }}
            status="live"
            updated="Live · updated 3 s ago"
            alerts={{ count: 4, label: 'Notifications, 4 need action', onOpen: noop }}
            user={{ name: 'Bisi Kalu', role: 'Store manager' }}
          />
          <BranchMenu
            label="Choose branch"
            selectedId="lk"
            onSelect={noop}
            options={[
              { id: 'all', name: 'All branches', detail: 'Combined view · head office' },
              { id: 'lk', name: 'Lekki Phase 1', detail: '23 shoppers in store' },
              { id: 'ik', name: 'Ikeja GRA', detail: '9 shoppers in store' },
            ]}
          />
          <NavTabs
            label="Reports"
            currentHref="#funnel"
            items={[
              { href: '#traffic', value: 'traffic', label: 'Traffic' },
              { href: '#funnel', value: 'funnel', label: 'Funnel' },
              { href: '#sales', value: 'sales', label: 'Sales' },
              { href: '#exit', value: 'exit', label: 'Exit and loss', count: 1 },
              { href: '#support', value: 'support', label: 'Support' },
            ]}
          />
          <Tabs
            label="Refunds"
            value={tab}
            onValueChange={setTab}
            items={[
              { value: 'decide', label: 'To decide', count: 2 },
              { value: 'head-office', label: 'Waiting for head office' },
              { value: 'record', label: 'To record' },
              { value: 'chargebacks', label: 'Chargebacks' },
            ]}
          >
            <p className="t-d-body m-0 text-secondary">Panel: {tab}</p>
          </Tabs>
          <Segmented
            label="Date range"
            value={range}
            onValueChange={setRange}
            items={[
              { value: 'today', label: 'Today' },
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
              { value: 'custom', label: 'Custom' },
            ]}
          />
          <Breadcrumbs
            items={[
              { label: 'Receipts', href: '#r' },
              { label: '22 Nov 2026', href: '#d' },
              { label: 'SKP-LK-04822' },
            ]}
          />
          <Pagination
            page={page}
            pageCount={4}
            onPage={setPage}
            summary="Showing 1–12 of 41 receipts"
          />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            <Kpi
              href="#sales"
              label="Sales today · 41 receipts"
              value="₦1,284,600"
              delta={{ text: '12% more than last Saturday', glyph: 'arrow-right', tone: 'good' }}
              definition="Sum of Paid receipts since 00:00 WAT, minus refunds. Source: Skipa database."
            />
            <Kpi
              href="#confirming"
              label="Payments confirming"
              value="2"
              delta={{ text: 'Oldest 1 min 40 s', glyph: 'clock', tone: 'neutral' }}
              definition="Orders in Pending state."
            />
            <Kpi
              href="#mismatch"
              label="Mismatch rate · 7 days"
              value="2.6%"
              delta={{
                text: 'Up from 0.9%. Above your 2% alert',
                glyph: 'arrow-right',
                tone: 'bad',
              }}
              definition="Mismatches ÷ flagged checks, last 7 days."
            />
            <Kpi
              href="#sync"
              label="POS sync"
              value=""
              loading
              definition="Last successful POS posting."
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

interface ReceiptRow {
  id: string;
  time: string;
  who: string;
  channel: string;
  amount: string;
  status: Status;
  tone?: 'new' | 'selected' | 'mismatch';
}

const ROWS: ReceiptRow[] = [
  {
    id: 'SKP-LK-04831',
    time: '14:41',
    who: 'Guest · +234 803 *** 4567',
    channel: 'Transfer',
    amount: '₦8,950',
    status: 'paid',
    tone: 'new',
  },
  {
    id: 'SKP-LK-04822',
    time: '14:36',
    who: 'Ngozi A.',
    channel: 'Card',
    amount: '₦31,300',
    status: 'exited',
    tone: 'selected',
  },
  {
    id: 'SKP-LK-04821',
    time: '14:29',
    who: 'Guest · +234 816 *** 2201',
    channel: 'Card',
    amount: '₦22,180',
    status: 'mismatch',
    tone: 'mismatch',
  },
  {
    id: 'SKP-LK-04818',
    time: '14:21',
    who: 'Tunde B.',
    channel: 'USSD',
    amount: '₦4,500',
    status: 'pending',
  },
  {
    id: 'SKP-LK-04815',
    time: '14:12',
    who: 'Halima S.',
    channel: 'Card',
    amount: '₦12,450',
    status: 'refund-requested',
  },
  {
    id: 'SKP-LK-04809',
    time: '13:58',
    who: 'Guest · +234 905 *** 7780',
    channel: 'Card',
    amount: '₦1,950',
    status: 'failed',
  },
];

function Tables() {
  return (
    <Section id="table" title="Table" wide>
      <Table
        caption="Receipts today at Lekki Phase 1"
        rows={ROWS}
        rowKey={(r) => r.id}
        rowTone={(r) => r.tone}
        toolbar={
          <>
            <div className="min-w-[280px] flex-1">
              <TextField kind="search" label="Search receipts" />
            </div>
            <Button variant="secondary" size="sm" icon="calendar" label="Today" />
            <Button variant="secondary" size="sm" icon="filter" label="Status: all" />
            <Button variant="secondary" size="sm" icon="download" label="Export CSV" />
          </>
        }
        columns={[
          {
            id: 'id',
            header: 'Receipt',
            cell: (r) => <span className="t-ref text-[13px]/[20px]">{r.id}</span>,
          },
          { id: 'time', header: 'Time', cell: (r) => r.time, sort: 'descending', onSort: noop },
          { id: 'who', header: 'Shopper', cell: (r) => r.who },
          { id: 'channel', header: 'Channel', cell: (r) => r.channel },
          { id: 'amount', header: 'Amount', align: 'right', cell: (r) => r.amount },
          {
            id: 'status',
            header: 'Status',
            cell: (r) => <StatusChip status={r.status} size="sm" />,
          },
        ]}
        footer={
          <Pagination page={1} pageCount={4} onPage={noop} summary="Showing 1–12 of 41 receipts" />
        }
      />
    </Section>
  );
}

const COPY = {
  pass: 'Readable. You can publish this colour.',
  buttonOnly: 'Fine for buttons. Too light for text links.',
  fail: 'Too hard to read. This colour can’t be published.',
  ratios: (r: { button: string; text: string }) =>
    `Button text ${r.button}:1 · as text on the page ${r.text}:1 · needs 4.5:1`,
  suggestion: (hex: string, ratio: string) => (
    <>
      Nearest readable shade <b>{hex}</b> ({ratio}:1)
    </>
  ),
  useSuggestion: 'Use this shade',
  previewButton: 'Pay ₦4,500',
};

function BrandInputs() {
  return (
    <Section id="brand-input" title="BrandInput">
      <LogoUpload
        label="Logo (square)"
        state="empty"
        title="Drop your logo here, or choose a file"
        message="PNG or SVG, square and wide versions. We compress it to under 50 KB."
        buttonLabel="Choose file"
        onFile={noop}
      />
      <LogoUpload
        label="Logo (square)"
        state="uploading"
        progress={64}
        title="adunni-logo-square.png"
        message="Uploading and compressing… 64%"
        buttonLabel="Cancel"
        onFile={noop}
        onCancel={noop}
      />
      <LogoUpload
        label="Logo (square)"
        state="error"
        title="adunni-logo.gif"
        message="This file type isn’t supported. Use PNG or SVG."
        buttonLabel="Choose file"
        onFile={noop}
      />
      {/* Contrast figures as packages/domain/contrast.ts will compute them (WCAG relative luminance). */}
      <ColourField
        label="Brand colour (primary)"
        hex="#7A1F4A"
        onHexChange={noop}
        copy={COPY}
        contrast={{ onColour: '#FFFFFF', buttonRatio: 10.4, textRatio: 9.6 }}
      />
      <ColourField
        label="Brand colour (primary)"
        hex="#F2C230"
        onHexChange={noop}
        onUseSuggestion={noop}
        copy={COPY}
        contrast={{
          onColour: '#23190F',
          buttonRatio: 10.9,
          textRatio: 1.6,
          suggestion: { hex: '#7F6619', ratio: 4.6 },
        }}
      />
    </Section>
  );
}

function BrandArt() {
  return (
    <Section id="brand" title="Wordmark · Mark · Avatar · Icon" wide>
      <Row>
        <Wordmark height={64} />
        <Wordmark height={30} />
        <Wordmark height={64} version="classic" />
        <span className="rounded-md bg-(--indigo-700) p-3">
          <Wordmark height={30} fg="var(--paper)" />
        </span>
        <Mark size={64} />
        <Mark size={32} />
        <Mark size={16} />
      </Row>
      <Row>
        {(Object.keys(AVATARS) as AvatarId[]).map((a, i) => (
          <Avatar key={a} avatar={a} size={56} selected={i === 0} />
        ))}
        {(Object.keys(AVATARS) as AvatarId[]).map((a) => (
          <Avatar key={a} avatar={a} size={36} />
        ))}
      </Row>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
        {(Object.keys(GLYPHS) as Glyph[]).map((g) => (
          <span key={g} className="t-d-caption flex flex-col items-center gap-1 text-secondary">
            <Icon glyph={g} size={24} className="text-primary" />
            {g}
          </span>
        ))}
      </div>
    </Section>
  );
}

function Overlays() {
  const [sheet, setSheet] = useState<
    'not-included' | 'not-found' | 'price-changed' | 'remove' | null
  >(null);
  const [dialog, setDialog] = useState(false);
  const [panel, setPanel] = useState(false);
  const [held, setHeld] = useState(false);
  return (
    <Section id="overlays" title="Sheet · Overlay">
      <Row>
        <Button
          variant="secondary"
          size="md"
          label="Not included"
          onClick={() => {
            setSheet('not-included');
          }}
        />
        <Button
          variant="secondary"
          size="md"
          label="Not found"
          onClick={() => {
            setSheet('not-found');
          }}
        />
        <Button
          variant="secondary"
          size="md"
          label="Price changed"
          onClick={() => {
            setSheet('price-changed');
          }}
        />
        <Button
          variant="secondary"
          size="md"
          label="Remove item"
          onClick={() => {
            setSheet('remove');
          }}
        />
        <Button
          variant="secondary"
          size="md"
          label="Switch off"
          onClick={() => {
            setDialog(true);
          }}
        />
        <Button
          variant="secondary"
          size="md"
          label="Receipt panel"
          onClick={() => {
            setPanel(true);
          }}
        />
        <Tooltip
          content={
            <>
              <b>Mismatch rate</b> = mismatches ÷ flagged checks, last 7 days, WAT.
            </>
          }
        >
          <Button
            variant="tertiary"
            size="md"
            icon="info"
            iconOnly
            label="What is the mismatch rate?"
          />
        </Tooltip>
      </Row>
      <Sheet
        open={sheet === 'not-included'}
        onOpenChange={() => {
          setSheet(null);
        }}
        glyph="info"
        tone="info"
        title="Not sold through Skipa here yet"
        body="Red wine 75 cl isn’t in the sections you can scan at Adunni Mart. Please pay for it at the till."
        primary={{
          label: 'OK, keep scanning',
          onClick: () => {
            setSheet(null);
          },
        }}
      />
      <Sheet
        open={sheet === 'not-found'}
        onOpenChange={() => {
          setSheet(null);
        }}
        glyph="search"
        title="We can’t read that barcode"
        body="Type the number printed under the barcode. It’s usually 13 digits."
        primary={{ label: 'Add item', onClick: noop }}
        secondary={{
          label: 'Cancel',
          onClick: () => {
            setSheet(null);
          },
        }}
      >
        <TextField kind="number" label="Barcode number" defaultValue="6151100054321" />
      </Sheet>
      <Sheet
        open={sheet === 'price-changed'}
        onOpenChange={() => {
          setSheet(null);
        }}
        glyph="tag"
        tone="warning"
        title="A price changed"
        body="The store updated a price since you scanned. Check the new total before you pay."
        primary={{ label: 'Pay ₦31,800', onClick: noop }}
        secondary={{ label: 'Remove this item', onClick: noop }}
      >
        <div className="flex flex-col rounded-md border border-subtle">
          <div className="flex justify-between gap-3 px-4 py-3">
            <span className="t-body-strong">Vegetable oil 1 L × 2</span>
            <span className="flex items-baseline gap-2">
              <s className="t-caption text-muted">₦6,400</s>
              <span className="t-money">₦6,900</span>
            </span>
          </div>
          <div className="flex justify-between gap-3 border-t border-subtle px-4 py-3">
            <span className="t-body-strong">New total</span>
            <span className="t-money">₦31,800</span>
          </div>
        </div>
      </Sheet>
      <Sheet
        open={sheet === 'remove'}
        onOpenChange={() => {
          setSheet(null);
        }}
        glyph="trash"
        title="Remove vegetable oil?"
        body="Both bottles will come off your cart. Put them back on the shelf."
        primary={{
          label: 'Remove',
          variant: 'destructive',
          onClick: () => {
            setSheet(null);
          },
        }}
        secondary={{
          label: 'Keep them',
          onClick: () => {
            setSheet(null);
          },
        }}
      />
      <ConfirmDialog
        open={dialog}
        onOpenChange={setDialog}
        glyph="power"
        tone="error"
        title="Switch off Skipa at Lekki Phase 1?"
        description="Takes effect within 10 seconds. You can switch it back on at any time."
        actions={
          <>
            <Button
              variant="tertiary"
              size="md"
              label="Keep it on"
              onClick={() => {
                setDialog(false);
              }}
            />
            <HoldButton
              label={held ? 'Switched off' : 'Hold to switch off'}
              holdingLabel="Keep holding…"
              onConfirm={() => {
                setHeld(true);
              }}
            />
          </>
        }
      >
        <ul className="t-d-body m-0 flex flex-col gap-[6px] rounded-md bg-sunken py-[14px] pr-4 pl-[34px]">
          <li>23 shoppers in store will be told to pay at the tills.</li>
          <li>2 payments already confirming will finish normally.</li>
          <li>New QR scans show “Skipa is off at this branch”.</li>
        </ul>
        <SelectField label="Reason (required, logged)" defaultValue="pos">
          <option value="pos">POS is down; can’t post sales</option>
          <option value="other">Something else</option>
        </SelectField>
        <span className="t-d-caption text-right text-muted">
          Press and hold for 1.5 seconds. Keyboard: hold Enter.
        </span>
      </ConfirmDialog>
      <SidePanel
        open={panel}
        onOpenChange={setPanel}
        eyebrow="SKP-LK-04822"
        title="₦31,300 · 13 items"
      >
        <Row>
          <StatusChip status="exited" />
          <StatusChip status="synced" label="Synced 2 min ago" />
        </Row>
      </SidePanel>
    </Section>
  );
}

function Gallery() {
  return (
    <TooltipProvider>
      <BrandScope
        brand={brand}
        className="flex min-h-screen flex-col gap-5 bg-page p-5 font-ui text-primary"
      >
        <header className="flex flex-wrap items-center gap-4">
          <Wordmark height={40} />
          <h1 className="t-d-h1 m-0">Components</h1>
          <nav aria-label="Brand mode" className="flex gap-2">
            {BRANDS.map((b) => (
              <a
                key={b}
                href={`?brand=${b}`}
                aria-current={b === brand ? 'page' : undefined}
                className={
                  b === brand
                    ? 't-d-label rounded-pill bg-brand-primary px-3 py-1 text-brand-on-primary no-underline'
                    : 't-d-label rounded-pill px-3 py-1 text-link'
                }
              >
                {b}
              </a>
            ))}
          </nav>
        </header>
        <main className="flex flex-col gap-5">
          <Buttons />
          <Chips />
          <div className="flex flex-wrap items-start gap-5">
            <Fields />
            <Controls />
            <Loadings />
            <Headers />
            <BrandInputs />
            <Overlays />
          </div>
          <Feedbacks />
          <States />
          <Dashboard />
          <Tables />
          <BrandArt />
        </main>
      </BrandScope>
    </TooltipProvider>
  );
}

const root = document.getElementById('root');
if (root !== null) {
  createRoot(root).render(
    <StrictMode>
      <Gallery />
    </StrictMode>,
  );
}
