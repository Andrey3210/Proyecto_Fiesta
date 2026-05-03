import { truthQuestionsByCategory } from './truth-questions.generated';

export type TruthCategoryKey =
  | 'divertidas'
  | 'comprometidas'
  | 'romanticas'
  | 'atrevidas'
  | 'incomodas';

type TruthCategoryMeta = {
  label: string;
  description: string;
};

type TruthCategoryDefinition = TruthCategoryMeta & {
  key: TruthCategoryKey;
  questions: readonly string[];
};

const questionsByCategory = truthQuestionsByCategory as Record<
  TruthCategoryKey,
  readonly string[]
>;

const categoryMeta: Record<TruthCategoryKey, TruthCategoryMeta> = {
  divertidas: {
    label: 'Divertidas & para romper el hielo',
    description: 'Perfectas para empezar el juego y calentar el ambiente.',
  },
  comprometidas: {
    label: 'Comprometidas & profundas',
    description: 'Para conocerse de verdad. Requieren honestidad brutal.',
  },
  romanticas: {
    label: 'Románticas & de pareja',
    description: 'Para parejas o para descubrir sentimientos ocultos.',
  },
  atrevidas: {
    label: 'Atrevidas & picantes',
    description: 'Solo para mayores de 18. Suben la temperatura del ambiente.',
  },
  incomodas: {
    label: 'Incómodas & para valientes',
    description: 'Las más difíciles de responder honestamente.',
  },
};

export const truthCategoryOrder = [
  'divertidas',
  'comprometidas',
  'romanticas',
  'atrevidas',
  'incomodas',
] as const satisfies readonly TruthCategoryKey[];

export const truthCategories = truthCategoryOrder.map((key) => ({
  key,
  ...categoryMeta[key],
  questions: questionsByCategory[key],
})) satisfies TruthCategoryDefinition[];

export const truthCategoryMap = Object.fromEntries(
  truthCategories.map((category) => [category.key, category]),
) as unknown as Record<TruthCategoryKey, TruthCategoryDefinition>;
