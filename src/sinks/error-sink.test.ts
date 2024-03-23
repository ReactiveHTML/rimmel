import { errorHandler } from './error-sink';

describe.skip('Error Handler', () => {

    describe('When an error is raised in a stream', () => {

        it('logs it to the console', () => {
            const message = 'test error';

            const e = console.error
            console.error = jest.fn();
            const h = errorHandler;

            h(new Error(message));
            expect(console.error).toHaveBeenCalledWith(message);
            console.error = e;
        });

    });

});
