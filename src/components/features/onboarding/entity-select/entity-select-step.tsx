import { ENTITY_OPTIONS } from "../onboarding.constants"
import type { Entity } from "../onboarding.types"
import { FieldError } from "../shared/field-error"
import { EntityCard } from "./entity-card"

type EntitySelectStepProps = {
  value?: Entity
  error?: string
  onSelect: (entity: Entity) => void
}

export function EntitySelectStep({ value, error, onSelect }: EntitySelectStepProps) {
  return (
    <fieldset className="space-y-4" aria-describedby={error ? "entity-error" : undefined}>
      <legend className="sr-only">How will you use Owlio?</legend>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {ENTITY_OPTIONS.map((option) => (
          <EntityCard
            key={option.value}
            entity={option.value}
            title={option.title}
            description={option.description}
            icon={option.icon}
            checked={value === option.value}
            onChange={() => onSelect(option.value)}
          />
        ))}
      </div>
      <FieldError id="entity-error" message={error} />
    </fieldset>
  )
}
