import type { ComponentType } from "react";

export interface ModuleDefinition {
  id: string;
  name: string;
  icon: string;
  path: string;
  order: number;
  Panel: ComponentType;
  Actions?: ComponentType;
  Footer?: ComponentType;
  badge?: number | null;
}