import { Link } from '@tanstack/react-router'
import { route } from '@/constants/routes'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useState, useEffect, useCallback } from 'react'
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconChevronRight,
  IconCommand,
  IconFeather,
  IconPalette,
  IconPlus,
  IconTopologyStar3,
  IconCpu,
  IconWorldSearch,
  IconFolderCode,
  IconPaperclip,
  IconPuzzle,
} from '@tabler/icons-react'
import { useMatches, useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { isCoworkEnabled } from '@/lib/version'

import { useModelProvider } from '@/hooks/useModelProvider'
import { getProviderTitle, isLocalProvider } from '@/lib/utils'
import ProvidersAvatar from '@/containers/ProvidersAvatar'
import { AddProviderDialog } from '@/containers/dialogs'
import {
  openAIProviderSettings,
  anthropicProviderSettings,
} from '@/constants/providers'
import cloneDeep from 'lodash/cloneDeep'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const HIDDEN_PROVIDER_IDS = new Set([
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
  'llamacpp',
  'llama.cpp',
])

const SettingsMenu = () => {
  const { t } = useTranslation()
  const [expandedProviders, setExpandedProviders] = useState(true)

  const matches = useMatches()
  const navigate = useNavigate()

  const { providers, addProvider } = useModelProvider()

  const createProvider = useCallback(
    (
      name: string,
      baseUrl: string,
      apiKey: string,
      apiType: ProviderApiType
    ) => {
      if (
        providers.some((e) => e.provider.toLowerCase() === name.toLowerCase())
      ) {
        toast.error(t('provider:providerAlreadyExists', { name }))
        return
      }
      const template =
        apiType === 'anthropic'
          ? anthropicProviderSettings
          : openAIProviderSettings
      const settings = cloneDeep(template) as ProviderSetting[]
      for (const s of settings) {
        if (s.key === 'base-url') {
          (s.controller_props as { value: string }).value = baseUrl
        } else if (s.key === 'api-key') {
          (s.controller_props as { value: string }).value = apiKey
        }
      }
      const newProvider: ProviderObject = {
        provider: name,
        active: true,
        models: [],
        settings,
        api_key: apiKey,
        base_url: baseUrl,
        ...(apiType === 'anthropic' ? { api_type: 'anthropic' as const } : {}),
      }
      addProvider(newProvider)
      setTimeout(() => {
        navigate({
          to: route.settings.providers,
          params: { providerName: name },
        })
      }, 0)
    },
    [providers, addProvider, t, navigate]
  )

  const settingsProviders = providers.filter((provider) => {
    if (HIDDEN_PROVIDER_IDS.has(provider.provider)) return false
    return !isLocalProvider(provider.provider)
  })

  const activeProviders = settingsProviders.filter((provider) => {
    if (!provider.active) return false
    if (!IS_MACOS && provider.provider === 'mlx') return false
    return true
  })

  const hiddenProviders = settingsProviders.filter((provider) => {
    if (provider.active) return false
    if (!IS_MACOS && provider.provider === 'mlx') return false
    return true
  })

  const renderActiveProvider = (provider: ProviderObject) => {
    const isRouteActive = matches.some(
      (match) =>
        match.routeId === '/settings/providers/$providerName' &&
        'providerName' in match.params &&
        match.params.providerName === provider.provider
    )
    return (
      <div
        key={provider.provider}
        className={cn(
          'flex px-2 items-center gap-1.5 cursor-pointer hover:bg-secondary/60 py-1 w-full rounded-sm text-foreground',
          isRouteActive && 'bg-secondary',
          provider.provider === 'llama.cpp' &&
            stepSetupRemoteProvider &&
            'hidden'
        )}
        onClick={() =>
          navigate({
            to: route.settings.providers,
            params: { providerName: provider.provider },
            ...(stepSetupRemoteProvider
              ? { search: { step: 'setup_remote_provider' } }
              : {}),
          })
        }
      >
        <ProvidersAvatar provider={provider} />
        <div className="truncate flex-1">
          <span>{getProviderTitle(provider)}</span>
        </div>
      </div>
    )
  }

  // Check if current route has a providerName parameter and expand providers submenu
  useEffect(() => {
    const hasProviderName = matches.some(
      (match) =>
        match.routeId === '/settings/providers/$providerName' &&
        'providerName' in match.params
    )
    const isProvidersRoute = matches.some(
      (match) => match.routeId === '/settings/providers/'
    )
    if (hasProviderName || isProvidersRoute) {
      setExpandedProviders(true)
    }
  }, [matches])

  // Check if we're in the setup remote provider step
  const stepSetupRemoteProvider = matches.some(
    (match) =>
      match.search &&
      typeof match.search === 'object' &&
      'step' in match.search &&
      match.search.step === 'setup_remote_provider'
  )

  const coreSettings = [
    {
      title: 'common:general',
      route: route.settings.general,
      icon: IconAdjustmentsHorizontal,
    },
    // "Appearance" is implemented by the existing Interface settings route.
    {
      title: 'common:appearance',
      route: route.settings.interface,
      icon: IconPalette,
    },
    { title: 'common:assistants', route: route.settings.assistant, icon: IconFeather },
    {
      title: 'common:attachments',
      route: route.settings.attachments,
      icon: IconPaperclip,
    },
    {
      title: 'common:web_search',
      route: route.settings.web_search,
      icon: IconWorldSearch,
    },
    ...(isCoworkEnabled()
      ? [
          {
            title: 'common:cowork',
            route: route.settings.cowork,
            icon: IconFolderCode,
          },
        ]
      : []),
    {
      title: 'common:keyboardShortcuts',
      route: route.settings.shortcuts,
      icon: IconCommand,
    },
    {
      title: 'common:hardware',
      route: route.settings.hardware,
      hasSubMenu: false,
      isEnabled: true,
      icon: IconCpu,
    },
    {
      title: 'common:extensions',
      route: route.settings.extensions,
      icon: IconPuzzle,
    },
  ]

  const integrationSettings = [
    {
      title: 'common:mcp-servers',
      route: route.settings.mcp_servers,
      icon: IconTopologyStar3,
    },
  ]

  return (
    <>
      <div className="h-full w-58 shrink-0 px-1.5 flex overflow-auto">
        <div className="flex flex-col gap-1 w-full font-medium">
          {/* Core settings */}
          {coreSettings.map((menu) => (
            <div key={menu.title}>
              <Link
                to={menu.route}
                className="block px-2 gap-1.5 cursor-pointer hover:dark:bg-secondary/60 hover:bg-secondary py-1 w-full rounded-sm [&.active]:dark:bg-secondary/80 [&.active]:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <menu.icon size={18} className="shrink-0 text-muted-foreground" />
                  <span>{t(menu.title)}</span>
                </div>
              </Link>
            </div>
          ))}

          {/* Integrations section */}
          <div className="mt-4">
            <span className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('common:integrations')}
              <span className="text-[11px] capitalize ml-2 font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
                {t('common:experimental')}
              </span>
            </span>
            <div className="mt-1 flex flex-col gap-1">
              {integrationSettings.map((menu) => (
                <Link
                  key={menu.title}
                  to={menu.route}
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:dark:bg-secondary/60 hover:bg-secondary rounded-sm [&.active]:dark:bg-secondary/80 [&.active]:bg-secondary"
                >
                  <menu.icon size={18} className="shrink-0 text-muted-foreground" />
                  <span>{t(menu.title)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Model Providers section */}
          <div className="mt-4">
            <div className="flex items-center justify-between pl-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('common:modelProviders')}
              </span>
              <AddProviderDialog onCreateProvider={createProvider}>
                <Button variant="ghost" size="icon-xs">
                  <IconPlus size={12} />
                </Button>
              </AddProviderDialog>
            </div>
            <div className="mt-1 flex flex-col gap-0.5">
              {activeProviders.length > 0 && (
                <>
                  <span className="px-2 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                    {t('common:remoteProviders')}
                  </span>
                  {activeProviders.map(renderActiveProvider)}
                </>
              )}

              {hiddenProviders.length > 0 && (
                <>
                  <button
                    className="flex items-center justify-between px-2 py-1 w-full rounded-sm text-muted-foreground hover:bg-secondary/60"
                    onClick={() => setExpandedProviders(!expandedProviders)}
                  >
                    <span className="text-sm">
                      {t('common:hiddenProviders', {
                        count: hiddenProviders.length,
                      })}
                    </span>
                    {expandedProviders ? (
                      <IconChevronDown size={14} />
                    ) : (
                      <IconChevronRight size={14} />
                    )}
                  </button>
                  {expandedProviders &&
                    hiddenProviders.map((provider) => {
                      const isRouteActive = matches.some(
                        (match) =>
                          match.routeId ===
                            '/settings/providers/$providerName' &&
                          'providerName' in match.params &&
                          match.params.providerName === provider.provider
                      )
                      return (
                        <div
                          key={provider.provider}
                          className={cn(
                            'flex px-2 items-center gap-1.5 cursor-pointer hover:bg-secondary/60 py-1 w-full rounded-sm text-muted-foreground',
                            isRouteActive && 'bg-secondary'
                          )}
                          onClick={() =>
                            navigate({
                              to: route.settings.providers,
                              params: { providerName: provider.provider },
                            })
                          }
                        >
                          <ProvidersAvatar provider={provider} />
                          <div className="truncate flex-1">
                            <span>{getProviderTitle(provider)}</span>
                          </div>
                        </div>
                      )
                    })}
                </>
              )}
            </div>
            <div className="m-3" />
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsMenu
