export type GameKey = 'GI' | 'HSR' | 'ZZZ';
export type GameType = GameKey;

export interface ConditionRule {
    type: 'stat_threshold' | 'element' | 'path' | 'role' | 'action' | 'stack_count'
    param: string | number
    operator?: 'gte' | 'lte' | 'eq' | 'ne'
}

export interface DatasetVersion {
    datasetVersion: string // e.g., '2025.01.15'
    gamePatch: string // e.g., '4.4'
    schemaVersion: string // e.g., 'v2'
    derivedFrom?: Record<string, string | undefined>
}
