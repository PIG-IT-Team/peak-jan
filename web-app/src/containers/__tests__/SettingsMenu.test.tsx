import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import SettingsMenu from '../SettingsMenu'
import { useNavigate, useMatches } from '@tanstack/react-router'
import { useModelProvider } from '@/hooks/useModelProvider'

vi.mock('@/lib/version', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/version')>()),
  isCoworkEnabled: () => channel.cowork,
}))

// Mock global platform constants - simulate desktop (Tauri) environment
const channel = vi.hoisted(() => ({ cowork: true }))

Object.defineProperty(global, 'IS_IOS', { value: false, writable: true })
Object.defineProperty(global, 'IS_ANDROID', { value: false, writable: true })
Object.defineProperty(global, 'IS_WEB_APP', { value: false, writable: true })

// Mock dependencies
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: any) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  useMatches: vi.fn(),
  useNavigate: vi.fn(),
}))

vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/hooks/useGeneralSetting', () => ({
  useGeneralSetting: vi.fn(() => ({})),
}))

vi.mock('@/hooks/useModelProvider', () => ({
  useModelProvider: vi.fn(() => ({
    providers: [
      {
        provider: 'azure',
        active: true,
        models: [],
      },
      {
        provider: 'llama.cpp',
        active: true,
        models: [],
      },
    ],
    addProvider: vi.fn(),
  })),
}))

vi.mock('@/containers/dialogs', () => ({
  AddProviderDialog: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

vi.mock('@/lib/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/utils')>()),
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  getProviderTitle: (provider: { provider: string }) => provider.provider,
  isLocalProvider: (provider: string) =>
    provider === 'llama.cpp' || provider === 'mlx',
}))

vi.mock('@/containers/ProvidersAvatar', () => ({
  default: ({ provider }: { provider: any }) => (
    <div data-testid={`provider-avatar-${provider.provider}`}>
      {provider.provider}
    </div>
  ),
}))


describe('SettingsMenu', () => {
  const mockNavigate = vi.fn()
  const mockMatches = [
    {
      routeId: '/settings/general',
      params: {},
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    channel.cowork = true

    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useMatches).mockReturnValue(mockMatches)
    vi.mocked(useModelProvider).mockReturnValue({
      providers: [
        { provider: 'azure', active: true, models: [] },
        { provider: 'llama.cpp', active: true, models: [] },
      ],
      addProvider: vi.fn(),
    })
  })

  it('renders all menu items', () => {
    render(<SettingsMenu />)

    expect(screen.getByText('common:general')).toBeInTheDocument()
    expect(screen.getByText('common:appearance')).toBeInTheDocument()
    expect(screen.queryByText('common:privacy')).not.toBeInTheDocument()
  })

  it('renders core settings links', () => {
    render(<SettingsMenu />)
    expect(screen.getByText('common:keyboardShortcuts')).toBeInTheDocument()
    expect(screen.getByText('common:assistants')).toBeInTheDocument()
    expect(screen.queryByText('common:local_api_server')).not.toBeInTheDocument()
    expect(screen.queryByText('common:https_proxy')).not.toBeInTheDocument()
    expect(screen.queryByText('common:privacy')).not.toBeInTheDocument()
  })

  it('lists the Cowork settings entry where Cowork ships', () => {
    render(<SettingsMenu />)
    expect(screen.getByText('common:cowork')).toBeInTheDocument()
  })

  it('omits the Cowork settings entry on builds that do not ship Cowork', () => {
    channel.cowork = false
    render(<SettingsMenu />)
    expect(screen.queryByText('common:cowork')).not.toBeInTheDocument()
    expect(screen.getByText('common:general')).toBeInTheDocument()
  })

  it('links to the Extensions settings page', () => {
    render(<SettingsMenu />)
    expect(screen.getByText('common:extensions').closest('a')).toHaveAttribute(
      'href',
      '/settings/extensions'
    )
  })

  it('renders integrations links', () => {
    render(<SettingsMenu />)
    expect(screen.getByText('common:mcp-servers')).toBeInTheDocument()
    expect(screen.queryByText('common:claude_code')).not.toBeInTheDocument()
  })

  it('shows provider expansion chevron when providers are active', () => {
    render(<SettingsMenu />)

    // There should be at least one button (the chevron)
    const chevronButtons = screen.getAllByRole('button')
    expect(chevronButtons.length).toBeGreaterThan(0)
  })

  it('shows expanded providers by default', () => {
    render(<SettingsMenu />)

    // Providers ARE expanded by default (expandedProviders starts as true)
    expect(screen.getByTestId('provider-avatar-azure')).toBeInTheDocument()
  })

  it('collapses disabled providers section when toggle is clicked', async () => {
    vi.mocked(useModelProvider).mockReturnValue({
      providers: [
        { provider: 'azure', active: true, models: [] },
        { provider: 'custom-provider', active: false, models: [] },
      ],
      addProvider: vi.fn(),
    })

    const user = userEvent.setup()
    render(<SettingsMenu />)

    // Disabled section is expanded by default.
    expect(screen.getByTestId('provider-avatar-custom-provider')).toBeInTheDocument()

    // Click the toggle to collapse the disabled section
    const toggleButton = screen.getByText('common:hiddenProviders')
    await user.click(toggleButton)

    // After collapsing, the custom provider should be hidden.
    expect(screen.queryByTestId('provider-avatar-custom-provider')).not.toBeInTheDocument()
  })

  it('auto-expands providers when on provider route', () => {
    vi.mocked(useMatches).mockReturnValue([
      {
        routeId: '/settings/providers/$providerName',
        params: { providerName: 'azure' },
      },
    ])

    render(<SettingsMenu />)

    expect(screen.getByTestId('provider-avatar-azure')).toBeInTheDocument()
  })

  it('highlights active provider in submenu', () => {
    vi.mocked(useMatches).mockReturnValue([
      {
        routeId: '/settings/providers/$providerName',
        params: { providerName: 'azure' },
      },
    ])

    render(<SettingsMenu />)

    const azureProvider = screen
      .getByTestId('provider-avatar-azure')
      .closest('div')
    expect(azureProvider).toBeInTheDocument()
  })

  it('navigates to provider when provider is clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsMenu />)

    // Providers are expanded by default, click directly on a provider
    const azureProvider = screen
      .getByTestId('provider-avatar-azure')
      .closest('div[class*="cursor-pointer"]')
    await user.click(azureProvider!)

    expect(mockNavigate).toHaveBeenCalled()
  })

  it('hides local providers during setup remote provider step', () => {
    vi.mocked(useMatches).mockReturnValue([
      {
        routeId: '/settings/providers/',
        params: {},
        search: { step: 'setup_remote_provider' },
      },
    ])

    render(<SettingsMenu />)

    expect(screen.getByTestId('provider-avatar-azure')).toBeInTheDocument()
    expect(screen.queryByTestId('provider-avatar-llama.cpp')).not.toBeInTheDocument()
    expect(screen.queryByText('common:localProviders')).not.toBeInTheDocument()
  })

  it('shows inactive providers in disabled section', () => {
    vi.mocked(useModelProvider).mockReturnValue({
      providers: [
        { provider: 'azure', active: true, models: [] },
        { provider: 'custom-provider', active: false, models: [] },
      ],
      addProvider: vi.fn(),
    })

    render(<SettingsMenu />)

    // Active provider shown normally
    expect(screen.getByTestId('provider-avatar-azure')).toBeInTheDocument()
    // Inactive provider shown in the disabled section (expanded by default)
    expect(screen.getByTestId('provider-avatar-custom-provider')).toBeInTheDocument()
    // Disabled section label is shown
    expect(screen.getByText('common:hiddenProviders')).toBeInTheDocument()
  })

  it('filters removed and local providers from persisted settings state', () => {
    const removedProviders = [
      'openai',
      'anthropic',
      'openrouter',
      'mistral',
      'groq',
      'xai',
      'gemini',
      'minimax',
      'huggingface',
      'nvidia',
      'nim',
    ]
    vi.mocked(useModelProvider).mockReturnValue({
      providers: [
        ...removedProviders.map((provider) => ({
          provider,
          active: true,
          models: [],
        })),
        { provider: 'llamacpp', active: true, models: [] },
        { provider: 'llama.cpp', active: true, models: [] },
        { provider: 'mlx', active: true, models: [] },
        { provider: 'azure', active: true, models: [] },
      ],
      addProvider: vi.fn(),
    })

    render(<SettingsMenu />)

    for (const provider of [
      ...removedProviders,
      'llamacpp',
      'llama.cpp',
      'mlx',
    ]) {
      expect(
        screen.queryByTestId(`provider-avatar-${provider}`)
      ).not.toBeInTheDocument()
    }
    expect(screen.getByTestId('provider-avatar-azure')).toBeInTheDocument()
    expect(screen.queryByText('common:localProviders')).not.toBeInTheDocument()
  })
})
