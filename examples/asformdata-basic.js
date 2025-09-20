// Example: Basic usage of AsFormData with Rimmel
// This is just a placeholder demo for docs — will expand later

import { rml, AsFormData, JSONDump } from 'rimmel';
import { Subject } from 'rxjs';

// Create a stream to collect form data
const formDataStream = new Subject();

document.body.innerHTML = rml`
  <form onsubmit="${AsFormData(formDataStream)}">
    <label>
      Name:
      <input name="name" required>
    </label>
    <br>
    <label>
      Email:
      <input name="email" type="email" required>
    </label>
    <br>
    <button type="submit">Submit</button>
  </form>

  <h3>Form Output:</h3>
  <div>${JSONDump(formDataStream)}</div>
`;