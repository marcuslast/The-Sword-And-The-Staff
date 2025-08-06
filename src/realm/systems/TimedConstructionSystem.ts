import { BuildingComponent, BuildingRecipe } from '../components/ModularBuilding';

export interface ConstructionPhase {
    id: string;
    name: string;
    duration: number; // in seconds
    components: BuildingComponent[];
    requirements?: {
        resources?: Record<string, number>;
        prerequisites?: string[]; // Phase IDs that must complete first
    };
    description: string;
}

export interface ConstructionProject {
    id: string;
    buildingType: string;
    recipe: BuildingRecipe;
    position: [number, number, number];
    startTime: number;
    phases: ConstructionPhase[];
    currentPhase: number;
    status: 'planned' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
    totalDuration: number;
    completedComponents: Set<string>;
    workers?: number; // Affects construction speed
}

export class TimedConstructionSystem {
    private projects = new Map<string, ConstructionProject>();
    private callbacks = new Map<string, (project: ConstructionProject) => void>();

    // Create construction phases from building recipe
    createConstructionPhases(recipe: BuildingRecipe): ConstructionPhase[] {
        const phases: ConstructionPhase[] = [];

        // Phase 1: Foundation and Structure
        const structuralComponents = this.getComponentsByType(recipe, ['foundation', 'wall', 'pillar']);
        if (structuralComponents.length > 0) {
            phases.push({
                id: 'foundation',
                name: 'Foundation & Structure',
                duration: 60, // 1 minute base time
                components: structuralComponents,
                requirements: {
                    resources: { stone: 50, wood: 30 }
                },
                description: 'Laying foundation and building structural elements'
            });
        }

        // Phase 2: Walls and Framework
        const wallComponents = this.getComponentsByType(recipe, ['wall']);
        if (wallComponents.length > 0) {
            phases.push({
                id: 'walls',
                name: 'Walls & Framework',
                duration: 90, // 1.5 minutes
                components: wallComponents,
                requirements: {
                    resources: { stone: 75, wood: 50 },
                    prerequisites: ['foundation']
                },
                description: 'Constructing walls and building framework'
            });
        }

        // Phase 3: Openings (Doors & Windows)
        const openingComponents = this.getComponentsByType(recipe, ['door', 'window']);
        if (openingComponents.length > 0) {
            phases.push({
                id: 'openings',
                name: 'Doors & Windows',
                duration: 45, // 45 seconds
                components: openingComponents,
                requirements: {
                    resources: { wood: 25, iron: 10 },
                    prerequisites: ['walls']
                },
                description: 'Installing doors and windows'
            });
        }

        // Phase 4: Roofing
        const roofComponents = this.getComponentsByType(recipe, ['roof']);
        if (roofComponents.length > 0) {
            phases.push({
                id: 'roofing',
                name: 'Roofing',
                duration: 75, // 1.25 minutes
                components: roofComponents,
                requirements: {
                    resources: { wood: 60, stone: 20 },
                    prerequisites: ['walls']
                },
                description: 'Installing roof and covering'
            });
        }

        // Phase 5: Finishing & Decoration
        const decorationComponents = this.getComponentsByType(recipe, ['decoration', 'chimney', 'stairs']);
        if (decorationComponents.length > 0) {
            phases.push({
                id: 'finishing',
                name: 'Finishing Touches',
                duration: 30, // 30 seconds
                components: decorationComponents,
                requirements: {
                    resources: { stone: 15, iron: 5 },
                    prerequisites: ['roofing']
                },
                description: 'Adding decorative elements and finishing touches'
            });
        }

        return phases;
    }

    private getComponentsByType(recipe: BuildingRecipe, types: string[]): BuildingComponent[] {
        const components: BuildingComponent[] = [];

        Object.values(recipe.components).forEach(levelComponents => {
            levelComponents.forEach(component => {
                if (types.includes(component.type)) {
                    components.push(component);
                }
            });
        });

        return components;
    }

    // Start a new construction project
    startConstruction(
        buildingType: string,
        recipe: BuildingRecipe,
        position: [number, number, number],
        workers: number = 1
    ): string {
        const projectId = `construction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const phases = this.createConstructionPhases(recipe);
        const totalDuration = phases.reduce((total, phase) => total + (phase.duration / workers), 0);

        const project: ConstructionProject = {
            id: projectId,
            buildingType,
            recipe,
            position,
            startTime: Date.now(),
            phases,
            currentPhase: 0,
            status: 'in_progress',
            totalDuration,
            completedComponents: new Set(),
            workers
        };

        this.projects.set(projectId, project);
        this.schedulePhaseCompletion(project);

        return projectId;
    }

    private schedulePhaseCompletion(project: ConstructionProject) {
        if (project.currentPhase >= project.phases.length) {
            this.completeConstruction(project.id);
            return;
        }

        const currentPhase = project.phases[project.currentPhase];
        const adjustedDuration = (currentPhase.duration / (project.workers || 1)) * 1000; // Convert to milliseconds

        setTimeout(() => {
            this.completePhase(project.id);
        }, adjustedDuration);
    }

    private completePhase(projectId: string) {
        const project = this.projects.get(projectId);
        if (!project || project.status !== 'in_progress') return;

        // Check if we have a current phase
        if (project.currentPhase >= project.phases.length) {
            this.completeConstruction(projectId);
            return;
        }

        const currentPhase = project.phases[project.currentPhase];

        // Mark all components in this phase as completed
        currentPhase.components.forEach(component => {
            const componentKey = `${component.type}_${component.position.join('_')}`;
            project.completedComponents.add(componentKey);
        });

        // Move to next phase
        project.currentPhase++;

        // Trigger callback for UI updates
        const callback = this.callbacks.get(projectId);
        if (callback) {
            callback(project);
        }

        // Schedule next phase or complete construction
        if (project.currentPhase < project.phases.length) {
            this.schedulePhaseCompletion(project);
        } else {
            this.completeConstruction(projectId);
        }
    }

    private completeConstruction(projectId: string) {
        const project = this.projects.get(projectId);
        if (!project) return;

        project.status = 'completed';

        // Trigger final callback
        const callback = this.callbacks.get(projectId);
        if (callback) {
            callback(project);
        }
    }

    // Get construction progress (0-1)
    getProgress(projectId: string): number {
        const project = this.projects.get(projectId);
        if (!project) return 0;

        if (project.status === 'completed') return 1;

        const phasesCompleted = project.currentPhase;
        const totalPhases = project.phases.length;

        if (phasesCompleted === 0) return 0;

        return phasesCompleted / totalPhases;
    }

    // Get detailed progress info
    getDetailedProgress(projectId: string): {
        overall: number;
        currentPhase: string;
        phaseProgress: number;
        componentsVisible: BuildingComponent[];
        nextComponents: BuildingComponent[];
        estimatedCompletion: number;
    } | null {
        const project = this.projects.get(projectId);
        if (!project) return null;

        // Handle completed projects
        if (project.status === 'completed') {
            return {
                overall: 1,
                currentPhase: 'Completed',
                phaseProgress: 1,
                componentsVisible: this.getAllComponents(project),
                nextComponents: [],
                estimatedCompletion: 0
            };
        }

        // Handle projects with no phases
        if (project.phases.length === 0) {
            return {
                overall: 0,
                currentPhase: 'No phases',
                phaseProgress: 0,
                componentsVisible: [],
                nextComponents: [],
                estimatedCompletion: 0
            };
        }

        // Handle invalid current phase index
        if (project.currentPhase >= project.phases.length) {
            return {
                overall: 1,
                currentPhase: 'Invalid phase',
                phaseProgress: 1,
                componentsVisible: this.getAllComponents(project),
                nextComponents: [],
                estimatedCompletion: 0
            };
        }

        const currentPhase = project.phases[project.currentPhase];
        const phaseStartTime = project.startTime +
            project.phases.slice(0, project.currentPhase)
                .reduce((total, phase) => total + (phase.duration * 1000 / (project.workers || 1)), 0);

        const phaseElapsed = Date.now() - phaseStartTime;
        const phaseDuration = (currentPhase.duration * 1000) / (project.workers || 1);
        const phaseProgress = Math.min(phaseElapsed / phaseDuration, 1);

        const componentsVisible = this.getVisibleComponents(project);
        const nextComponents = currentPhase.components;

        const remainingTime = project.totalDuration * 1000 - (Date.now() - project.startTime);
        const estimatedCompletion = Date.now() + Math.max(0, remainingTime);

        return {
            overall: this.getProgress(projectId),
            currentPhase: currentPhase.name,
            phaseProgress,
            componentsVisible,
            nextComponents,
            estimatedCompletion
        };
    }

    private getVisibleComponents(project: ConstructionProject): BuildingComponent[] {
        const visibleComponents: BuildingComponent[] = [];

        // Add all components from completed phases
        for (let i = 0; i < project.currentPhase; i++) {
            visibleComponents.push(...project.phases[i].components);
        }

        return visibleComponents;
    }

    private getAllComponents(project: ConstructionProject): BuildingComponent[] {
        const allComponents: BuildingComponent[] = [];

        project.phases.forEach(phase => {
            allComponents.push(...phase.components);
        });

        return allComponents;
    }

    // Pause/Resume construction
    pauseConstruction(projectId: string): boolean {
        const project = this.projects.get(projectId);
        if (!project || project.status !== 'in_progress') return false;

        project.status = 'paused';
        return true;
    }

    resumeConstruction(projectId: string): boolean {
        const project = this.projects.get(projectId);
        if (!project || project.status !== 'paused') return false;

        project.status = 'in_progress';
        this.schedulePhaseCompletion(project);
        return true;
    }

    // Cancel construction
    cancelConstruction(projectId: string): boolean {
        const project = this.projects.get(projectId);
        if (!project) return false;

        project.status = 'cancelled';
        this.projects.delete(projectId);
        this.callbacks.delete(projectId);
        return true;
    }

    // Speed up construction (e.g., with more workers or resources)
    speedUpConstruction(projectId: string, speedMultiplier: number): boolean {
        const project = this.projects.get(projectId);
        if (!project || project.status !== 'in_progress') return false;

        project.workers = (project.workers || 1) * speedMultiplier;

        // Recalculate total duration
        project.totalDuration = project.phases.reduce(
            (total, phase) => total + (phase.duration / project.workers!), 0
        );

        return true;
    }

    // Register callback for project updates
    onProjectUpdate(projectId: string, callback: (project: ConstructionProject) => void) {
        this.callbacks.set(projectId, callback);
    }

    // Remove callback
    offProjectUpdate(projectId: string) {
        this.callbacks.delete(projectId);
    }

    // Get all active projects
    getActiveProjects(): ConstructionProject[] {
        return Array.from(this.projects.values()).filter(
            project => project.status === 'in_progress' || project.status === 'paused'
        );
    }

    // Get project by ID
    getProject(projectId: string): ConstructionProject | null {
        return this.projects.get(projectId) || null;
    }

    // Clean up completed projects
    cleanupCompletedProjects() {
        Array.from(this.projects.entries()).forEach(([id, project]) => {
            if (project.status === 'completed' || project.status === 'cancelled') {
                this.projects.delete(id);
                this.callbacks.delete(id);
            }
        });
    }
}

// Global instance
export const constructionSystem = new TimedConstructionSystem();
