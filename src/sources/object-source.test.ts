import { MockElement, MockEvent } from '../test-support';
import { isObjectSource, ObjectSource } from './object-source';

describe('Object Source', () => {

    describe('Given a [attribute, target] pair', () => {

        it('Creates an Object Source', () => {
            const object: any = {};
            const testAttribute = 'someAttribute';
            const newData = 'new value';

            const el = MockElement({
                tagName: 'INPUT',
                type: 'text',
                value: newData,
            });
            const eventData = MockEvent('input', {
                target: el as HTMLInputElement
            });

            const source = ObjectSource(testAttribute, object).bind(el);

            source(eventData);
            expect(object[testAttribute]).toEqual(newData);
        });

        it('Creates an Array Source', () => {
            const arr = [0, 1, 2, 3, 4];
            const testAttribute = 2;
            const newData = 'new stuff';

            const el = MockElement({
                tagName: 'INPUT',
                type: 'text',
                value: newData,
            });

            const eventData = MockEvent('input', {
                target: el as HTMLInputElement
            });

            const source = ObjectSource(testAttribute, arr).bind(el);

            // @ts-ignore
            source(eventData);
            expect(arr[testAttribute]).toEqual(newData);
        });

        describe('for a checkbox', () => {

          it('Creates a boolean Object Source', () => {
              const object: any = {};
              const testAttribute = 'someAttribute';
              const newData = true;

              const el = MockElement({
                  tagName: 'INPUT',
                  type: 'checkbox',
                  checked: newData,
              });
              const eventData = MockEvent('change', {
                  target: el as HTMLInputElement
              });

              const source = ObjectSource(testAttribute, object).bind(el);

              source(eventData);
              expect(object[testAttribute]).toEqual(newData);
          });

        });

        describe('for any other element', () => {

          it('Creates an Object Source from its content', () => {
              const object: any = {};
              const testAttribute = 'someAttribute';
              const newData = 'some content';

              const el = MockElement({
                  tagName: 'DIV',
                  innerText: newData,
              });
              const eventData = MockEvent('randomevent', {
                  target: el
              });

              const source = ObjectSource(testAttribute, object).bind(el);

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

