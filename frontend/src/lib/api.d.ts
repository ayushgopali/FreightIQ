export declare const API: string;

export declare function getMeta(): Promise<any>;
export declare function postForecast(p: any): Promise<any>;
export declare function postDecide(p: any): Promise<any>;
export declare function getPortScreen(cargoT: any): Promise<any>;
export declare function getBacktest(): Promise<any>;
export declare function postTimeMachine(p: any): Promise<any>;

export declare function fmtUsd(v: any, digits?: number): string;
export declare function fmtT(v: any): string;
export declare function fmtPct(v: any, digits?: number): string;
export declare function fmtRate(v: any): string;
