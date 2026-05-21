// src/lib/brand-map.ts
//
// Maps domain types (GPU category, model family, runtime slug) to the
// brand keys used by <BrandLogo>. Keeps the icon wiring in one place so
// catalog code stays brand-agnostic.

import type { GpuCategory } from './gpus';
import type { ModelFamily } from './models';

export function gpuManufacturer(category: GpuCategory): string {
  switch (category) {
    case 'rtx-30':
    case 'rtx-40':
    case 'rtx-50':
    case 'workstation':
    case 'datacenter':
      return 'nvidia';
    case 'apple':
      return 'apple';
    case 'amd':
      return 'amd';
    case 'intel':
      return 'intel';
  }
}

export function modelProvider(family: ModelFamily): string {
  switch (family) {
    case 'Meta':
      return 'meta';
    case 'Alibaba':
      return 'alibabacloud';
    case 'OpenAI':
      return 'openai';
    case 'Mistral':
      return 'mistral';
    case 'Microsoft':
      return 'microsoft';
    case 'Google':
      return 'google';
    case 'DeepSeek':
      return 'deepseek';
    case '01.AI':
      return '01-ai';
    case 'Cohere':
      return 'cohere';
    case 'IBM':
      return 'ibm';
    case 'BigCode':
      return 'bigcode';
  }
}

export function runtimeBrand(slug: string): string {
  // The five hosting runtimes. simple-icons only has Ollama; the rest get
  // text-mark fallbacks via <BrandLogo>.
  return slug;
}
