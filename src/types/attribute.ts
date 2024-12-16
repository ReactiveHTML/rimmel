import type { BehaviorSubject, Subject } from "rxjs";
import { ClassAttribute } from "./class";
import { DatasetObject } from "./dataset";
import { EventObject } from "./event-listener";
import { StyleObject } from "./style";
import { ContentAttribute } from "./content";
// import { ValueAttribute } from "./value";

export type HTMLStandardAttributes = Partial<HTMLElement>;
export type ExcludeKeys = keyof EventObject | keyof ClassAttribute | keyof DatasetObject | keyof StyleObject | keyof ContentAttribute | 'value';

/**
 * Any generic HTML that's not a class, style, data-* or event attribute 
 */
export type GenericAttribute<T = string> = {
    [P in Exclude<keyof HTMLStandardAttributes | string, ExcludeKeys>]: T | Subject<T> | BehaviorSubject<T>;
};
