import { MockElement } from '../test-support';
import { isObjectSource, ObjectSource, ObjectSourceExpression } from './pojo-source';

describe('Object Source', () => {

    describe('Given a [target, attribute] pair', () => {

        it('Creates an Object Source', () => {
            const object: any = {};
            const testAttribute = 'someAttribute';
            const data = <ObjectSourceExpression<typeof object>>[object, testAttribute];
            const newData = 'new value';

            const el = MockElement({
                value: newData,
            });
            const eventData = {
                target: {
                    value: newData,
                }
            };

            const source = ObjectSource(data).bind(el);

            source(eventData);
            expect(object[testAttribute]).toEqual(newData);
        });

        it('Creates an Array Source', () => {
            const arr = [0, 1, 2, 3, 4];
            const testAttribute = 2;
            const data = <ObjectSourceExpression<typeof arr>>[arr, testAttribute];
            const newData = 'new value';

            const el = MockElement({
                value: newData,
            });
            const source = ObjectSource(data).bind(el);

            const eventData = {
                target: {
                    value: newData,
                }
            };

            source(eventData);
            expect(arr[testAttribute]).toEqual(newData);
        });

    });

});

describe('isObjectSource', () => {
    it('tells if it is an object source', () => {
        expect(isObjectSource([{}, 'a'])).toEqual(true);
    });
});
