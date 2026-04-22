import { Request, Response } from 'express';
export declare const createProject: (req: Request, res: Response) => Promise<void>;
export declare const listProjects: (req: Request, res: Response) => Promise<void>;
export declare const getProject: (req: Request, res: Response) => Promise<void>;
export declare const analyzeProject: (req: Request, res: Response) => Promise<void>;
export declare const analyzeProjectBatch: (req: Request, res: Response) => Promise<void>;
export declare const getAnalysisStatus: (req: Request, res: Response) => Promise<void>;
export declare const getIssues: (req: Request, res: Response) => Promise<void>;
export declare const getMetrics: (req: Request, res: Response) => Promise<void>;
export declare const getQualityGateStatus: (req: Request, res: Response) => Promise<void>;
export declare const resolveIssue: (req: Request, res: Response) => Promise<void>;
export declare const generateBadge: (req: Request, res: Response) => Promise<void>;
/**
 * Discover and import projects from ANALIZADOR folder
 */
export declare const importLocalProjects: (req: Request, res: Response) => Promise<void>;
/**
 * List available projects from ANALIZADOR folder (no import)
 */
export declare const discoverLocalProjects: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=projects.controller.d.ts.map