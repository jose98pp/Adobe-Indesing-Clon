export type ElementType = 
  | 'masthead'
  | 'headline'
  | 'article'
  | 'image'
  | 'quote'
  | 'box'
  | 'divider';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  locked?: boolean;
  hidden?: boolean;
}

export interface MastheadElement extends BaseElement {
  type: 'masthead';
  newspaperName: string;
  motto: string;
  editionDate: string;
  editionNumber: string;
  price: string;
  section: string;
  fontFamily: string;
  fontSize: number;
  styleVariant: 'classic-gothic' | 'roman-editorial' | 'modern-condensed' | 'regional-banner' | 'latitud-official';
  borderColor: string;
  accentColor: string;
  subBadgeText?: string;
  badgeNumber?: string;
  websiteUrl?: string;
  socialHandles?: string;
  locationInfo?: string;
  leftEar?: { title: string; subtitle: string; bgColor?: string; textColor?: string };
  rightEar?: { title: string; subtitle: string; highlight: string; bgColor?: string };
}

export interface HeadlineElement extends BaseElement {
  type: 'headline';
  kicker: string;
  headline: string;
  subtitle: string;
  byline: string;
  date: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  kickerColor: string;
  showKicker: boolean;
  showSubtitle: boolean;
  showByline: boolean;
}

export interface ArticleElement extends BaseElement {
  type: 'article';
  headline?: string;
  body: string;
  columns: 1 | 2 | 3 | 4;
  columnGap: number;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'justify' | 'center';
  dropCap: boolean;
  paragraphIndent: boolean;
  textColor: string;
  showColumnDividers: boolean;
  dividerColor: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  url: string;
  caption: string;
  credit: string;
  objectFit: 'cover' | 'contain';
  grayscale: boolean;
  borderWidth: number;
  borderColor: string;
  aspectRatioLock: boolean;
  headlineOverlay?: string;
}

export interface QuoteElement extends BaseElement {
  type: 'quote';
  quote: string;
  author: string;
  role: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textColor: string;
  borderStyle: 'left-bar' | 'top-bottom' | 'ornate-quotes' | 'minimal';
  accentColor: string;
}

export interface BoxElement extends BaseElement {
  type: 'box';
  title: string;
  content: string;
  boxStyle: 'breaking' | 'infobox' | 'opinion' | 'ad' | 'summary';
  bgColor: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
  badgeText?: string;
  badgeBgColor?: string;
  imageUrl?: string;
}

export interface DividerElement extends BaseElement {
  type: 'divider';
  style: 'solid' | 'double' | 'dashed' | 'dotted' | 'ornate';
  thickness: number;
  color: string;
}

export type NewspaperElement = 
  | MastheadElement
  | HeadlineElement
  | ArticleElement
  | ImageElement
  | QuoteElement
  | BoxElement
  | DividerElement;

export type PageFormat = 'broadsheet' | 'tabloid' | 'compact-a4';

export type EditorialStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published';

export interface EditorialStatusLog {
  id: string;
  fromStatus?: EditorialStatus;
  toStatus: EditorialStatus;
  user: string;
  timestamp: number;
  comment?: string;
}

export interface EditorialPage {
  id: string;
  pageNumber: number;
  title: string;
  section: string;
  elements: NewspaperElement[];
}

export interface PageFormatConfig {
  name: string;
  width: number;
  height: number;
  defaultColumns: number;
  description: string;
}

export interface NewspaperProject {
  id: string;
  title: string;
  issueNumber: string;
  publicationDate: string;
  format: PageFormat;
  width: number;
  height: number;
  gridColumns: number;
  gridGutter: number;
  margin: number;
  backgroundColor: string;
  elements: NewspaperElement[];
  // Editorial workflow & publication on latitud18.ultimahora-tv.com
  status?: EditorialStatus;
  assignedReviewer?: string;
  scheduledAt?: string;
  publishedAt?: string;
  publishedUrl?: string;
  statusHistory?: EditorialStatusLog[];
  domain?: string;
  // Multi-page editorial support
  pages?: EditorialPage[];
  activePageIndex?: number;
}

export interface LatitudTemplatePackage {
  schemaVersion: '1.0';
  type: 'latitud-template';
  name: string;
  description: string;
  author: string;
  createdAt: string;
  targetDomain: string;
  project: NewspaperProject;
}

export interface VersionSnapshot {
  id: string;
  name: string;
  timestamp: number;
  author: string;
  description: string;
  elementCount: number;
  projectData: NewspaperProject;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  activeElementId?: string | null;
  lastSeen: number;
}

export interface TemplatePreset {
  id: string;
  name: string;
  tag: string;
  description: string;
  thumbnailColor: string;
  format: PageFormat;
  project: NewspaperProject;
}
