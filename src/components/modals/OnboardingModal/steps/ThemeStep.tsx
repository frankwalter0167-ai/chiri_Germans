import Palette from 'lucide-react/icons/palette';
import SunMoon from 'lucide-react/icons/sun-moon';
import { ColorSchemeSelect } from '$components/ColorSchemeSelect';
import { ColorSwatchPicker } from '$components/ColorSwatchPicker';
import { ThemeOption } from '$components/modals/OnboardingModal/ThemeOption';
import { useSettingsStore } from '$context/settingsContext';
import {
  getAppearanceColorState,
  getColorSchemeSelection,
  shouldResetAccentForFarbvariante,
  THEME_OPTIONS,
} from '$utils/color/scheme';

export const ThemeStep = () => {
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    colorScheme,
    colorSchemeFarbvariante,
    setColorScheme,
    setColorSchemeFarbvariante,
  } = useSettingsStore();

  const {
    effectiveMode,
    activeScheme,
    availableFarbvariantes,
    activeFarbvariante,
    resolvedAccentColor,
    schemeOptions,
    flavorOptions,
    accentOptions,
  } = getAppearanceColorState({ theme, accentColor, colorScheme, colorSchemeFarbvariante });

  const handleSchemeChange = (schemeId: string) => {
    const selection = getColorSchemeSelection(schemeId, effectiveMode);
    if (!selection) return;

    if (selection.theme) {
      setTheme(selection.theme);
    }

    setColorScheme(selection.colorScheme, selection.colorSchemeFarbvariante, selection.accentColor);
  };

  const handleFarbvarianteChange = (flavorId: string) => {
    const flavor = activeScheme.flavors.find((candidate) => candidate.id === flavorId);
    if (!flavor) return;

    setColorSchemeFarbvariante(flavorId);

    if (shouldResetAccentForFarbvariante(accentColor, flavor)) {
      setAccentColor(flavor.defaultAccent);
    }
  };

  return (
    <div className="space-y-3">
      <section className="rounded-lg border border-surface-200 p-3 dark:border-surface-700">
        <div className="mb-3 flex items-center gap-2">
          <SunMoon className="h-4 w-4 text-primary-ink" />
          <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">Design</h3>
        </div>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((option) => (
            <ThemeOption
              key={option.value}
              icon={option.icon}
              label={option.label}
              selected={theme === option.value}
              value={option.value}
              onSelect={setTheme}
            />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700">
        <div className="p-3">
          <div className="mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary-ink" />
            <h3 className="font-semibold text-sm text-surface-900 dark:text-surface-100">Farben</h3>
          </div>

          <div className="grid gap-3">
            <div>
              <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
                Farbschema
              </p>
              <ColorSchemeSelect
                label="Farbschema"
                value={colorScheme}
                options={schemeOptions}
                onChange={handleSchemeChange}
              />
            </div>

            {availableFarbvariantes.length > 1 && (
              <div>
                <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
                  Farbvariante
                </p>
                <ColorSchemeSelect
                  label="Farbvariante"
                  value={activeFarbvariante.id}
                  options={flavorOptions}
                  onChange={handleFarbvarianteChange}
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-surface-200 border-t dark:border-surface-700" />

        <div className="p-3">
          <p className="mb-2 font-medium text-surface-500 text-xs dark:text-surface-400">
            Akzentfarbe
          </p>
          <ColorSwatchPicker
            options={accentOptions}
            value={accentColor}
            colorInputValue={resolvedAccentColor}
            onSelect={setAccentColor}
            onCustomChange={setAccentColor}
            selectedVariant="border"
          />
        </div>
      </section>
    </div>
  );
};
