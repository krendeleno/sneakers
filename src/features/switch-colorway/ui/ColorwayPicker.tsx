import { getTranslations, type Locale } from '@/shared/i18n';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui';

type ColorwayPickerProps = {
  variants: string[];
  value: string | null;
  onChange: (variant: string) => void;
  locale: Locale;
};

export function ColorwayPicker({ variants, value, onChange, locale }: ColorwayPickerProps) {
  if (variants.length === 0) return null;

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      spacing={2}
      aria-label={getTranslations(locale).colorway}
      value={value ?? variants[0]}
      // Radix emits '' when the active item is pressed again; a colorway is always selected, so ignore it.
      onValueChange={(variant) => variant && onChange(variant)}
      className="flex-wrap"
    >
      {variants.map((variant) => (
        <ToggleGroupItem key={variant} value={variant}>
          {variant}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
