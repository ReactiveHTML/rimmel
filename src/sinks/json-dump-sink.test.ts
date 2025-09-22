import { MockElement } from '../test-support';
import { JSONDumpSink } from './json-dump-sink';

describe('JSONDump Sink', () => {

    describe('Given any object', () => {

        it('formats it as JSON in the output', () => {
            const el = MockElement();
            const sink = JSONDumpSink(<HTMLElement>el);
            const str = {
                foo: 'bar',
                baz: 'qux',
                abc: 123,
                def: true,
                ghi: [1, 2, 3],
                jkl: { a: 1, b: 2, c: 3 },
            };

            const expected = `<pre>{\n  \"foo\": \"bar\",\n  \"baz\": \"qux\",\n  \"abc\": 123,\n  \"def\": true,\n  \"ghi\": [\n    1,\n    2,\n    3\n  ],\n  \"jkl\": {\n    \"a\": 1,\n    \"b\": 2,\n    \"c\": 3\n  }\n}</pre>`;


            sink(str);
            expect(el.innerHTML).toEqual(expected);
        });

    });

});
