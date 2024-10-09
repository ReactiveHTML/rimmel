import { MockElement } from '../test-support';
import { Catch } from './error-sink';

// describe.skip('Error Handler', () => {

//     describe('When an error is raised in a stream', () => {

//         it('logs it to the console', () => {
//             const message = 'test error';

//             const e = console.error
//             console.error = jest.fn();
//             const h = errorHandler;

//             h(new Error(message));
//             expect(console.error).toHaveBeenCalledWith(message);
//             console.error = e;
//         });

//     });

// });

describe('Catch Sink', () => {

    it('Catches errors as innerHTML', async () => {
        const el = MockElement();
        const expectedString = 'foo';
        const stream = Promise.reject('failure');
        const sink = Catch(stream, () => expectedString);

        expect(await sink).toEqual(expectedString);
    });

});
