import { KnowledgeBaseNewItem } from 'src/types/bots';
import { ValueOf } from 'src/types/objectHelpers';

export const BASE_TYPES: { name: string; value: KnowledgeBaseNewItem['type'] }[] = [
  {
    name: 'Website',
    value: 'website',
  },
  {
    name: 'MEM',
    value: 'mem',
  },
] as const;

export const BASE_TYPE_SETTINGS: Record<
  ValueOf<(typeof BASE_TYPES)[number]>,
  KnowledgeBaseNewItem
> = {
  website: {
    type: 'website',
    url: '',
  },
  mem: {
    type: 'mem',
    text: '',
  },
};
