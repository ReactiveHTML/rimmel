import { render } from '../../dist/rxhtml.es.js';
const { Subject } = rxjs;

const hours = new Subject();
const mins = new Subject();
const secs = new Subject();

setInterval(() => {
  const date = new Date();
  hours.next(date.getHours());
  mins.next(date.getMinutes());
  secs.next(date.getSeconds());
}, 1000);

document.body.innerHTML = render`
  <div class="clock">
    <span class="hours">${hours}</span>
    <span class="mins">${mins}</span>
    <span class="secs">${secs}</span>
  </div>
`;
