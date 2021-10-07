import { render } from '../../dist/rxhtml.es.js';
import TextInput from './textInput.js';
const { BehaviorSubject } = rxjs;

const disabled = new BehaviorSubject({ disabled: 'disabled' });

function onValid(isValid) {
  if (isValid) {
    disabled.next({ disabled: undefined });
  } else {
    disabled.next({ disabled: 'disabled' });
  }
}

document.body.innerHTML = render`
  <div class="subscribe">
    ${TextInput(onValid)}
    <button type="button" ${disabled}>
      Subscribe
    </button>
  </div>
`;
