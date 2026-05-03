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
  emoji: string;
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
    label: 'Divertidas',
    description: 'Para romper el hielo y subir el ambiente.',
    emoji: '🎉',
  },
  comprometidas: {
    label: 'Comprometidas',
    description: 'Más profundas, más sinceras.',
    emoji: '💬',
  },
  romanticas: {
    label: 'Románticas',
    description: 'Para parejas o crushes.',
    emoji: '💘',
  },
  atrevidas: {
    label: 'Atrevidas',
    description: 'Suben la temperatura rápido.',
    emoji: '🔥',
  },
  incomodas: {
    label: 'Incómodas',
    description: 'Solo para valientes.',
    emoji: '😬',
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
