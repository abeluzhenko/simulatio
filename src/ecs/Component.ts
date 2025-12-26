/**
 * Component marker interface - all components must implement this
 */
export interface Component {}

/**
 * Component constructor type for identifying component types
 */
export type ComponentConstructor<T extends Component = Component> = new (
  ...args: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
) => T
