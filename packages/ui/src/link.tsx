// Navigation components stay router-agnostic: apps pass `renderLink` to use TanStack Router's
// <Link>; the default is a plain <a href>.
import type { ReactNode } from 'react';

export interface LinkRenderProps {
  href: string;
  className: string;
  'aria-current'?: 'page';
  'aria-label'?: string;
  title?: string;
  children: ReactNode;
}

export type RenderLink = (props: LinkRenderProps) => ReactNode;

export const defaultLink: RenderLink = ({ children, ...props }) => <a {...props}>{children}</a>;
