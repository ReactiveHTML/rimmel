import { MockElement } from '../test-support';
import { isPOJOSource, POJOSource, POJOSourceHandler } from './pojo-source';

describe('Object Source', () => {

    describe('Given a [target, attribute] pair', () => {

        it('Creates an Object Source', () => {
            const object: any = {};
            const testAttribute = 'someAttribute';
            const data = <POJOSourceHandler>[object, testAttribute];
            const newData = 'new value';

            const el = MockElement({
                value: newData,
            });
            const source = POJOSource(data).bind(el);

            source(/* Event */);
            expect(object[testAttribute]).toEqual(newData);
        });

        it('Creates an Array Source', () => {
            const arr = [0, 1, 2, 3, 4];
            const testAttribute = 2;
            const data = <POJOSourceHandler>[arr, testAttribute];
            const newData = 'new value';

            const el = MockElement({
                value: newData,
            });
            const source = POJOSource(data).bind(el);

            source(/* Event */);
            expect(arr[testAttribute]).toEqual(newData);
        });

    });

});

describe('isObjectSource', () => {
    it('tells if it is an object source', () => {
        expect(isPOJOSource([{}, 'a'])).toEqual(true);
    });
});
