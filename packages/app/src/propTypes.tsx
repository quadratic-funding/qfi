export type SideNavProps = {
  onGuideOpen: () => void;
  onSettingsOpen: () => void;
};
export type LayoutProps = {
  isSettingsOpen: boolean;
  onSettingsOpen: () => void;
  onSettingsClose: () => void;
  onGuideOpen : () => void;
  onGuideClose : () => void;
  isGuideOpen : boolean;
};

export type BallotOptionProps = {
  ballotOption?: Option;
  to?: string;
  onClick?: () => void;
  lastOption?: boolean;

  votes?: number;
};

export type Option = {
  name: string;
  id: string;
  recipientId: number;
  address: string;
  url: string;
  description: string;
  logo: string;
  banner: string;
  problemSpace: string;
  tagline: string;
};
