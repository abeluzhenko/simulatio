/**
 * ECS Core Exports
 *
 * This module exports all core ECS functionality including:
 * - World: Entity and component management
 * - Query: Component-based entity filtering
 * - System: Behavior/logic containers
 * - Feature: Pluggable particle system interface
 * - FeatureManager: System registration and ordering
 */

export { World, Entity, Component, ComponentConstructor } from './World'
export { Query } from './Query'
export { System, SystemCoordinator } from './System'
export { Feature, SystemRegistration, SystemPhase } from './Feature'
export { FeatureManager } from './FeatureManager'
