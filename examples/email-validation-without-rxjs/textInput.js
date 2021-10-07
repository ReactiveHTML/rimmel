import { render } from '../../dist/rxhtml.es.js';
const { Subject } = rxjs;

const regex = /^[^@]+@[^@]+\.[^@]+$/;

export default (onValid) => {
  const inputClass = new Subject();

  function onChange(e) {
    const { value } = e.target;
    if (!value) {
      inputClass.next();
    } else {
      const isValid = regex.test(value);

      onValid(isValid);

      const newClass = {
        green: isValid,
        red: !isValid,
      };

      inputClass.next(newClass);
    }
  }

  return render`
    <div class="base ${inputClass}">
      <input type="email" onchange="${onChange}" />
    </div>
  `;
}
