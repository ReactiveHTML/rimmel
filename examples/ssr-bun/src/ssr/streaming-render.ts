import type { Observable, Subscription } from 'rxjs';
import type { HTMLString } from "../../../../src/types";

export const streamingRender = (source: Observable<HTMLString>, req: Request) => {
	return new ReadableStream<Uint8Array>({
		start(controller) {
			const encoder = new TextEncoder();
			const subscription = source.subscribe({
				next(chunk) {
					controller.enqueue(encoder.encode(String(chunk)));
				},
				error(error) {
					controller.error(error);
				},
				complete() {
					controller.close();
				}
			});

			req.signal?.addEventListener('abort', () => {
				subscription?.unsubscribe();
				try {
					controller.close();
				} catch {}
			});
		}
	});
};