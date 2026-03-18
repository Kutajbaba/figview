export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  // Provided by the Figma file API for nodes; used to classify mobile vs desktop.
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FigmaPage {
  id: string;
  name: string;
  type: 'CANVAS';
  children: FigmaNode[];
}

export interface FigmaFileResponse {
  name: string;
  document: {
    id: string;
    name: string;
    type: 'DOCUMENT';
    children: FigmaPage[];
  };
  thumbnailUrl?: string;
}

export interface FigmaImagesResponse {
  images: Record<string, string>; // nodeId -> image URL
}

export interface ScreenFrame {
  id: string;
  name: string;
  pageId: string;
  pageName: string;
  thumbnailUrl?: string;
  protoUrl: string;
  kind: 'mobile' | 'desktop';
}

export interface FigmaConfig {
  token: string;
  fileKey: string;
  protoFileKey?: string; // may differ from design file key
  rawUrl: string;
}
