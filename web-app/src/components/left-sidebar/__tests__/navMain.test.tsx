import '@testing-library/jest-dom/vitest'
import type { ReactNode } from 'react'
import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string
    children: ReactNode
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => mocks.navigate,
}))
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@/hooks/useThreadManagement', () => ({
  useThreadManagement: () => ({ addFolder: vi.fn() }),
}))
vi.mock('@/hooks/useSearchDialog', () => ({
  useSearchDialog: () => ({ open: false, setOpen: vi.fn() }),
}))
vi.mock('@/hooks/useProjectDialog', () => ({
  useProjectDialog: () => ({ open: false, setOpen: vi.fn() }),
}))
vi.mock('@/hooks/useAgentMode', () => ({
  useAgentMode: Object.assign(() => ({}), {
    getState: () => ({ removeThread: vi.fn(), setAgentMode: vi.fn() }),
  }),
}))
vi.mock('@/containers/PlatformMetaKey', () => ({
  PlatformMetaKey: () => null,
}))
vi.mock('@/containers/dialogs/AddProjectDialog', () => ({
  default: () => null,
}))
vi.mock('@/containers/dialogs/SearchDialog', () => ({
  SearchDialog: () => null,
}))
vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: ReactNode }) => <li>{children}</li>,
  SidebarMenuButton: ({
    asChild,
    children,
    ...props
  }: {
    asChild?: boolean
    children: ReactNode
  }) => (asChild ? <>{children}</> : <button {...props}>{children}</button>),
}))

import { NavMain } from '../NavMain'

it('omits the Hub destination from main navigation', () => {
  render(<NavMain />)

  expect(screen.queryByText('common:hub')).not.toBeInTheDocument()
  expect(screen.getByText('common:settings')).toBeInTheDocument()
})
