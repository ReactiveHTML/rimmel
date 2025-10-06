import { rml } from '../../../dist/esm/index.js';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

let idCounter = 1;
const adjectives = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const colours = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const nouns = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

function _random(max) {
    return Math.round(Math.random() * 1000) % max;
}

class Store {
    constructor() {
        this.data = [];
        this.selected = null;
        this.dataSubject = new BehaviorSubject([]);
        this.selectedSubject = new BehaviorSubject(null);
    }

    buildData(count = 1000) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push({
                id: idCounter++,
                label: `${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`
            });
        }
        return data;
    }

    updateData(mod = 10) {
        for (let i = 0; i < this.data.length; i += mod) {
            this.data[i] = { ...this.data[i], label: this.data[i].label + ' !!!' };
        }
        this.dataSubject.next([...this.data]);
    }

    delete(id) {
        const idx = this.data.findIndex(d => d.id === id);
        if (idx >= 0) {
            this.data.splice(idx, 1);
            this.dataSubject.next([...this.data]);
        }
    }

    run() {
        this.data = this.buildData();
        this.selected = null;
        this.dataSubject.next(this.data);
        this.selectedSubject.next(null);
    }

    add() {
        this.data = this.data.concat(this.buildData(1000));
        this.dataSubject.next([...this.data]);
    }

    update() {
        this.updateData();
    }

    select(id) {
        this.selected = id;
        this.selectedSubject.next(id);
    }

    runLots() {
        this.data = this.buildData(10000);
        this.selected = null;
        this.dataSubject.next(this.data);
        this.selectedSubject.next(null);
    }

    clear() {
        this.data = [];
        this.selected = null;
        this.dataSubject.next([]);
        this.selectedSubject.next(null);
    }

    swapRows() {
        if (this.data.length > 998) {
            const tmp = this.data[1];
            this.data[1] = this.data[998];
            this.data[998] = tmp;
            this.dataSubject.next([...this.data]);
        }
    }
}

const store = new Store();

const renderRows = combineLatest([
    store.dataSubject,
    store.selectedSubject
]).pipe(
    map(([data, selectedId]) => {
        return data.map(item => {
            const isSelected = item.id === selectedId ? ' class="danger"' : '';
            return `
                <tr${isSelected} data-id="${item.id}">
                    <td class="col-md-1">${item.id}</td>
                    <td class="col-md-4">
                        <a class="lbl">${item.label}</a>
                    </td>
                    <td class="col-md-1">
                        <a class="remove">
                            <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                        </a>
                    </td>
                    <td class="col-md-6"></td>
                </tr>
            `;
        }).join('');
    })
);

function setupEventDelegation() {
    const tbody = document.getElementById('tbody');
    
    tbody.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.classList.contains('lbl')) {
            const tr = target.closest('tr');
            const id = parseInt(tr.dataset.id);
            store.select(id);
        }
        
        if (target.classList.contains('glyphicon-remove') || target.classList.contains('remove')) {
            const tr = target.closest('tr');
            const id = parseInt(tr.dataset.id);
            store.delete(id);
        }
    });
}

const App = () => {
    return rml`
        <div class="container">
            <div class="jumbotron">
                <div class="row">
                    <div class="col-md-6">
                        <h1>Rimmel (keyed)</h1>
                    </div>
                    <div class="col-md-6">
                        <div class="row">
                            <div class="col-sm-6 smallpad">
                                <button type="button" class="btn btn-primary btn-block" id="run" onclick="${() => store.run()}">Create 1,000 rows</button>
                            </div>
                            <div class="col-sm-6 smallpad">
                                <button type="button" class="btn btn-primary btn-block" id="runlots" onclick="${() => store.runLots()}">Create 10,000 rows</button>
                            </div>
                            <div class="col-sm-6 smallpad">
                                <button type="button" class="btn btn-primary btn-block" id="add" onclick="${() => store.add()}">Append 1,000 rows</button>
                            </div>
                            <div class="col-sm-6 smallpad">
                                <button type="button" class="btn btn-primary btn-block" id="update" onclick="${() => store.update()}">Update every 10th row</button>
                            </div>
                            <div class="col-sm-6 smallpad">
                                <button type="button" class="btn btn-primary btn-block" id="clear" onclick="${() => store.clear()}">Clear</button>
                            </div>
                            <div class="col-sm-6 smallpad">
                                <button type="button" class="btn btn-primary btn-block" id="swaprows" onclick="${() => store.swapRows()}">Swap Rows</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <table class="table table-hover table-striped test-data">
                <tbody id="tbody">
                    ${renderRows}
                </tbody>
            </table>
            <span class="preloadicon glyphicon glyphicon-remove" aria-hidden="true"></span>
        </div>
    `;
};

document.getElementById('main').innerHTML = App();

setTimeout(() => {
    setupEventDelegation();
}, 0);