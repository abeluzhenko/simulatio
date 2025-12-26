# Simulatio - 2D Particle Simulation Framework

## Overview

Browser-based particle simulation framework in TypeScript supporting dual architectures: **OOP** (original) and **ECS** (new). Real-time visualization with 120 FPS target, thousands of particles, multiple rendering backends and spatial indexing strategies.

**Current State**: ~6,000+ LOC, Milestones 1-4 complete (functional ECS + ParticleLife), both architectures coexist, fully backward compatible.

---

## Dual Architecture

### OOP Architecture (Original)
- Monolithic particle classes with inheritance
- Direct storage manipulation per particle
- 5 presets: SimpleCollision, Darwin, Polygons, ConveyLife, ParticleLife

### ECS Architecture (New)
- Entity-Component-System with pluggable features
- Batch spatial updates
- 1 preset: ParticleLife (ECS)
- **Key Design**: Two-layer (Core + Feature), zero coupling, declarative dependencies

**Both share**: Rendering engines, storage systems, UI components

---

## File Structure (Essential)

```
src/
├── app.tsx                     # Bootstrap, dual architecture support
├── simulation/
│   ├── Simulation.ts           # OOP engine
│   └── ECSSimulation.ts        # ECS engine
├── ecs/                        # === ECS CORE ===
│   ├── World.ts                # Entity/component management
│   ├── Query.ts                # Component queries with caching
│   ├── System.ts               # System base + coordinator
│   ├── Feature.ts              # Feature plugin interface
│   ├── FeatureManager.ts       # System ordering (topological sort)
│   ├── components/             # 6 core: Transform, Velocity, Physics, BoundingBox, Visual, ForceAccumulator
│   └── systems/                # 8 core: Spatial, PhysicsIntegration, Boundary*, Collision*, BoundingBoxUpdate, VisualUpdate
├── storage/
│   ├── Storage.ts              # Interface: add, update, delete, intersecting, nearest
│   ├── SimpleStorage.ts        # O(n) linear
│   ├── MyQTStorage.ts          # Custom quadtree (primary)
│   ├── SimpleQTStorage.ts      # simple-quadtree wrapper
│   └── RBushStorage.ts         # R-tree
├── render/
│   ├── Canvas2DRender.ts       # 2D context API
│   ├── WebGLRender.ts          # WebGL2 with GLSL shaders
│   └── ECSRenderAdapter.ts     # ECS → RenderItem bridge
├── particles/
│   ├── {Preset}/particle.ts    # OOP implementations
│   └── ParticleLife/           # Has both OOP + ECS
│       ├── particle.ts         # OOP version
│       ├── ParticleLifeFeature.ts  # ECS feature plugin
│       ├── components/         # ParticleKind, SocialForces, GravityWell
│       └── systems/            # SocialForceSystem, ParticleLifePhysicsSystem
└── math/
    ├── Vector2.ts              # 2D vector ops: distance, quadDistance, normalize, subtract
    ├── Rect.ts                 # AABB utilities
    └── Random.ts               # Seeded PRNG
```

---

## Core Types & Interfaces

### Storage Interface
```typescript
interface Storage<Item extends StorageItem> {
  add(id: ItemId, item: Item): void
  update(id: ItemId, rect: Rect): void
  delete(id: ItemId): void
  intersecting(rect: Rect): IterableIterator<Item>
  nearest(point: Vector2, k: number): IterableIterator<Item>
  [Symbol.iterator](): IterableIterator<Item>
}
```

### ECS Core Types
```typescript
type Entity = number  // Unique identifier
interface Component {}  // Marker interface

// Feature plugin interface
abstract class Feature {
  abstract getSystems(world: World, context: any): SystemRegistration[]
  abstract createEntity(world: World, options: any): Entity
}

interface SystemRegistration {
  system: System
  before?: string[]  // Declarative ordering
  after?: string[]
  phase?: 'early' | 'physics' | 'late'
}
```

### Graphics Primitives
```typescript
type Circle = { type: 'circle', x, y, radius, color, strokeWidth, strokeColor, visible }
type Rectangle = { type: 'rectangle', x, y, width, height, ... }
type Line = { type: 'line', x1, y1, x2, y2, ... }
type Graphics = Circle | Rectangle | Line
```

---

## ECS System Execution Flow

ParticleLife (ECS) systems execute in this order:

```
1. SpatialSystem [early]
   → Batch update Storage with all BoundingBox entities

2. SocialForceSystem [physics, after: SpatialSystem]
   → Query spatial neighbors, calculate social forces
   → Accumulate forces in ForceAccumulator

3. ParticleLifePhysicsSystem [physics, after: SocialForceSystem]
   → Apply forces to velocity with damping
   → Update position from velocity, reset forces

4. BoundaryWrapSystem [physics, after: ParticleLifePhysicsSystem]
   → Wrap entities at world boundaries (toroidal)

5. BoundingBoxUpdateSystem [late, after: BoundaryWrapSystem]
   → Sync BoundingBox rects with Transform positions

6. VisualUpdateSystem [late, after: BoundingBoxUpdateSystem]
   → Sync graphics positions with Transform
```

**System Ordering**: Handled by FeatureManager via topological sort of declarative dependencies.

---

## Development Workflow

### Commands
```bash
yarn install        # Install dependencies
yarn start          # Dev server at http://localhost:1234
yarn build          # Production build to dist/
yarn test           # Jest test suite (56 tests: World + SpatialSystem × 4 storages)
```

### Adding a New Particle System

**OOP Approach** (traditional):
1. Create `src/particles/{Name}/` with `particle.ts`, `config.ts`, `ui.tsx`
2. Register in `app.tsx` PRESETS array

**ECS Approach** (recommended):
1. Create feature components in `src/particles/{Name}/components/`
2. Create feature systems in `src/particles/{Name}/systems/`
3. Implement `{Name}Feature` class extending `Feature`
4. Register in `app.tsx` PRESETS array with `type: 'ecs'`

### Adding a Storage Strategy
1. Implement `Storage<Item>` interface
2. Add to `app.tsx` STORAGES array and `paramToStorage` factory
3. Write tests in `{Name}Storage.test.ts`

---

## Key Patterns & Conventions

### Architecture Patterns
- **Strategy**: Interchangeable Storage/Render backends
- **Factory**: ItemFactory for OOP, Feature.createEntity for ECS
- **Adapter**: ECSRenderAdapter bridges ECS → RenderItem
- **Observer**: Metric callbacks for performance stats

### Naming Conventions
- **PascalCase**: Classes (`MyQTStorage`, `Canvas2DRender`)
- **camelCase**: Functions/variables (`createGraphics`, `itemToNode`)
- **SCREAMING_SNAKE_CASE**: Constants (`SIMULATION_FPS`, `PERFORMANCE_FRAME`)

### Code Style
- Strict TypeScript (no implicit any)
- Generic constraints: `Storage<Item extends StorageItem>`
- Discriminated unions: `Graphics = Circle | Rectangle | Line`
- Deferred operations in ECS (flush() pattern)

---

## Important Implementation Details

### Storage Containment Optimization
MyQTStorage skips re-insertion if particle still in same node (MyQTStorage.ts:77).

### ECS Deferred Operations
All entity/component mutations are deferred until `world.flush()` to avoid iteration issues.

### System Dependencies
FeatureManager uses Kahn's algorithm for topological sort. Circular dependencies throw error.

### Spatial System Adapter
SpatialSystem wraps Storage via SpatialEntity adapter. No Storage interface modifications needed.

---

## Configuration

**Storage Hierarchy**:
1. LocalStorage (persistent across sessions)
2. Default values (defined in preset configs)

**Config Keys**:
- `general`: Preset, storage, renderer, debug mode, speed, UI visibility
- `{presetId}`: Preset-specific configuration

**Persistence**: Auto-saved to localStorage with 200ms debounce.

---

## Testing

**Unit Tests**: Storage correctness, math utilities, ECS World (Jest)
**Integration Tests**: SpatialSystem with all 4 storage implementations
**Performance Tests**: Standalone Node.js scripts in `performance-tests/`

**Test Status**: 56/56 passing
- 24 World tests
- 32 SpatialSystem tests (8 tests × 4 storage types)

---

## Debugging

### Debug Mode
Enable via UI: `Debug: Storage`
- Visualizes quadtree node boundaries (green boxes)
- Shows particle AABBs (yellow boxes)

### Performance
- Real-time FPS graph (bottom-left canvas)
- Export CSV: `window.saveMetric()`

### Common Issues
- Low FPS: Check particle count, try SimpleStorage to isolate overhead
- TypeScript errors: Import Component from `Component.ts`, Entity from `Entity.ts`

---

## Tech Stack

**Runtime**: TypeScript 5.3.3, React 18.3.1, Parcel 2.11.0
**Graphics**: Canvas 2D API, WebGL 2 with GLSL shaders
**Spatial**: Custom quadtree, RBush (R-tree), simple-quadtree
**Testing**: Jest 29.7.0

**Key Dependencies**:
- Production: react, rbush, simple-quadtree, classnames
- Dev: @babel/*, jest, prettier, eslint

---

## Migration Status

**Complete** (Milestones 1-4):
- ✅ ECS Core Infrastructure
- ✅ Spatial Integration
- ✅ ParticleLife Feature
- ✅ Simulation Integration

**Pending** (Milestones 5-6):
- ⏳ Visual regression tests, performance benchmarks
- ⏳ Migration guide for remaining presets

**See**: `refactoring.md` for detailed migration plan.

---

## Quick Reference

### Key Files
- `src/app.tsx` - Application entry point
- `src/ecs/World.ts` - ECS foundation
- `src/ecs/FeatureManager.ts` - System ordering
- `src/storage/MyQTStorage.ts` - Primary spatial index
- `src/simulation/ECSSimulation.ts` - ECS simulation engine

### Important Functions
- `world.flush()` - Apply deferred operations
- `query.invalidate()` - Clear query cache
- `featureManager.registerFeature()` - Add feature plugin
- `storage.intersecting(rect)` - Range query
- `storage.nearest(point, k)` - K-NN query

### Typical Workflow
1. User selects preset in UI
2. app.tsx creates simulation (OOP or ECS based on preset type)
3. AppLoop drives render/simulation at 120 FPS
4. For ECS: FeatureManager executes systems in dependency order
5. Renderers iterate Storage/ECSRenderAdapter to draw graphics

---

## License & Author

**License**: MIT
**Author**: Anton Beluzhenko <anton@beluzhenko.me>
