import { MockElement, MockEvent } from '../test-support';
import { isObjectSource, ObjectSource, ObjectSourceExpression } from './object-source';

describe('Object Source', () => {

    describe('Given a [target, attribute] pair', () => {

        it('Creates an Object Source', () => {
            const object: any = {};
            const testAttribute = 'someAttribute';
            const data = <ObjectSourceExpression<typeof object>>[object, testAttribute];
            const newData = 'new value';

            const el = MockElement({
                tagName: 'INPUT',
                value: newData,
            });
            const eventData = MockEvent('input', {
                target: {
                    value: newData,
                } as HTMLInputElement
            });

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
                tagName: 'INPUT',
                value: newData,
            });

            const eventData = MockEvent('input', {
                target: {
                    value: newData,
                } as HTMLInputElement
            });

            const source = ObjectSource(data).bind(el);

            source(eventData);
            expect(arr[testAttribute]).toEqual(newData);
        });

        describe('for a checkbox', () => {

          it('Creates a boolean Object Source', () => {
              const object: any = {};
              const testAttribute = 'someAttribute';
              const data = <ObjectSourceExpression<typeof object>>[object, testAttribute];
              const newData = true;

              const el = MockElement({
                  tagName: 'INPUT',
                  type: 'checkbox',
                  checked: newData,
              });
              const eventData = MockEvent('change', {
                  target: {
                      checked: newData,
                  } as HTMLInputElement
              });

              const source = ObjectSource(data).bind(el);

              source(eventData);
              expect(object[testAttribute]).toEqual(newData);
          });

        });

        describe('for any other element', () => {

          it('Creates an Object Source from its content', () => {
              const object: any = {};
              const testAttribute = 'someAttribute';
              const data = <ObjectSourceExpression<typeof object>>[object, testAttribute];
              const newData = 'some content';

              const el = MockElement({
                  tagName: 'DIV',
                  innerText: newData,
              });
              const eventData = MockEvent('randomevent', {
                  target: {
                      innerText: newData,
                  } as HTMLDivElement
              });

              const source = ObjectSource(data).bind(el);

              source(eventData);
              expect(object[testAttribute]).toEqual(newData);
          });

        });

    });

});

describe('isObjectSource', () => {
    it('tells if it is an object source', () => {
        expect(isObjectSource([{}, 'a'])).toEqual(true);
    });
});

