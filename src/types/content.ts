import { MaybeFuture } from "./futures";

export type ContentAttribute = {
    innerHTML?: MaybeFuture<string>;
    innerText?: MaybeFuture<string>;
    textContent?: MaybeFuture<string>;
};
