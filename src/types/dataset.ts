import { MaybeFuture } from "./futures";

/**
 * An object that represents a dataset with present or future values.
**/
export type DatasetFuture = {
  [key in keyof DOMStringMap]: MaybeFuture<string>;
};

/**
 * An object that represents a dataset.
**/
export type DatasetObject = DOMStringMap | DatasetFuture;
