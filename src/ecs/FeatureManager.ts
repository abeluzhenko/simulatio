import { Feature, SystemRegistration, SystemPhase } from './Feature'
import { System, SystemCoordinator } from './System'
import { World } from './World'

/**
 * Phase priority for coarse-grained ordering
 */
const PHASE_PRIORITY: Record<SystemPhase, number> = {
  early: 0,
  physics: 1,
  late: 2,
}

/**
 * Manages feature registration and system ordering.
 * Resolves system dependencies using topological sort.
 */
export class FeatureManager {
  private features: Map<string, Feature> = new Map()
  private systemCoordinator: SystemCoordinator
  private systemRegistrations: SystemRegistration[] = []

  constructor(private world: World) {
    this.systemCoordinator = new SystemCoordinator()
  }

  /**
   * Registers a feature and adds its systems to the coordinator
   */
  registerFeature(feature: Feature, context?: unknown): void {
    if (this.features.has(feature.name)) {
      throw new Error(`Feature ${feature.name} is already registered`)
    }

    this.features.set(feature.name, feature)
    feature.init?.(this.world)

    // Get systems from feature
    const registrations = feature.getSystems(this.world, context)
    this.systemRegistrations.push(...registrations)

    // Rebuild system order with new registrations
    this.rebuildSystemOrder()
  }

  /**
   * Registers a standalone system (not from a feature)
   */
  registerSystem(registration: SystemRegistration): void {
    this.systemRegistrations.push(registration)
    this.rebuildSystemOrder()
  }

  /**
   * Unregisters a feature and removes its systems
   */
  unregisterFeature(featureName: string): void {
    const feature = this.features.get(featureName)
    if (!feature) {
      return
    }

    feature.destroy?.(this.world)
    this.features.delete(featureName)

    // Remove systems from this feature
    // Note: This is simplified - in production you'd track which systems belong to which feature
    this.rebuildSystemOrder()
  }

  /**
   * Updates all systems in dependency order
   */
  update(dt: number): void {
    this.systemCoordinator.update(dt)
  }

  /**
   * Destroys all systems and features
   */
  destroy(): void {
    for (const feature of this.features.values()) {
      feature.destroy?.(this.world)
    }
    this.features.clear()
    this.systemCoordinator.destroy()
    this.systemRegistrations.length = 0
  }

  /**
   * Gets a registered feature by name
   */
  getFeature(name: string): Feature | undefined {
    return this.features.get(name)
  }

  /**
   * Rebuilds the system execution order based on current registrations
   */
  private rebuildSystemOrder(): void {
    // Clear existing systems
    this.systemCoordinator.destroy()

    // Resolve dependencies and get ordered systems
    const orderedSystems = this.resolveDependencies(this.systemRegistrations)

    // Add systems to coordinator in order
    for (const system of orderedSystems) {
      this.systemCoordinator.addSystem(system)
    }
  }

  /**
   * Resolves system dependencies using topological sort
   */
  private resolveDependencies(registrations: SystemRegistration[]): System[] {
    // Build system name -> registration map
    const systemMap = new Map<string, SystemRegistration>()
    for (const reg of registrations) {
      const name = reg.system.getName()
      if (systemMap.has(name)) {
        throw new Error(`Duplicate system name: ${name}`)
      }
      systemMap.set(name, reg)
    }

    // Build dependency graph
    const graph = new Map<string, Set<string>>() // system -> systems it depends on (must run after)
    const inDegree = new Map<string, number>() // system -> number of dependencies

    // Initialize graph
    for (const name of systemMap.keys()) {
      graph.set(name, new Set())
      inDegree.set(name, 0)
    }

    // Add edges based on before/after constraints
    for (const [name, reg] of systemMap) {
      // "after" means this system depends on those systems
      if (reg.after) {
        for (const afterName of reg.after) {
          if (systemMap.has(afterName)) {
            graph.get(name)!.add(afterName)
            inDegree.set(name, inDegree.get(name)! + 1)
          }
        }
      }

      // "before" means those systems depend on this system
      if (reg.before) {
        for (const beforeName of reg.before) {
          if (systemMap.has(beforeName)) {
            graph.get(beforeName)!.add(name)
            inDegree.set(beforeName, inDegree.get(beforeName)! + 1)
          }
        }
      }
    }

    // Topological sort using Kahn's algorithm
    const result: System[] = []
    const queue: string[] = []

    // Start with systems that have no dependencies
    for (const [name, degree] of inDegree) {
      if (degree === 0) {
        queue.push(name)
      }
    }

    // Sort queue by phase priority
    const sortByPhase = (names: string[]) => {
      names.sort((a, b) => {
        const phaseA = systemMap.get(a)!.phase ?? 'physics'
        const phaseB = systemMap.get(b)!.phase ?? 'physics'
        return PHASE_PRIORITY[phaseA] - PHASE_PRIORITY[phaseB]
      })
    }

    sortByPhase(queue)

    while (queue.length > 0) {
      const name = queue.shift()!
      const reg = systemMap.get(name)!
      result.push(reg.system)

      // Reduce in-degree for dependent systems
      for (const [depName, deps] of graph) {
        if (deps.has(name)) {
          deps.delete(name)
          inDegree.set(depName, inDegree.get(depName)! - 1)

          if (inDegree.get(depName) === 0) {
            queue.push(depName)
            sortByPhase(queue)
          }
        }
      }
    }

    // Check for cycles
    if (result.length !== systemMap.size) {
      const missing = Array.from(systemMap.keys()).filter(
        (name) => !result.find((s) => s.getName() === name),
      )
      throw new Error(
        `Circular dependency detected in systems: ${missing.join(', ')}`,
      )
    }

    return result
  }
}
