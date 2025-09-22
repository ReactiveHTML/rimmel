import { asap } from '../lib/drain';

import { AppendHTMLSink, APPEND_HTML_SINK_TAG } from '../sinks/append-html-sink';
import { AttributeObjectSink } from '../sinks/attribute-sink';
import { BlurSink, BLUR_SINK_TAG } from '../sinks/blur-sink';
import { CheckedSink, CHECKED_SINK_TAG } from '../sinks/checked-sink';
import { ClosedSink, CLOSED_SINK_TAG } from '../sinks/closed-sink';
import { DisabledSink, DISABLED_SINK_TAG } from '../sinks/disabled-sink';
import { FocusSink, FOCUS_SINK_TAG } from '../sinks/focus-sink';
import { InnerHTMLSink, INNER_HTML_SINK_TAG } from '../sinks/inner-html-sink';
import { InnerTextSink, INNER_TEXT_SINK_TAG } from '../sinks/inner-text-sink';
import { JSONDumpSink, JSON_DUMP_SINK_TAG } from '../sinks/json-dump-sink';
import { MIXIN_SINK_TAG } from '../sinks/mixin-sink';
import { PrependHTMLSink, PREPEND_HTML_SINK_TAG } from '../sinks/prepend-html-sink';
import { RemovedSink, REMOVED_SINK_TAG } from '../sinks/removed-sink';
import { ReadonlySink, READ_ONLY_SINK_TAG } from '../sinks/readonly-sink';
import { StyleSink, StyleObjectSink, STYLE_OBJECT_SINK_TAG } from '../sinks/style-sink';
import { ClassObjectSink, CLASS_SINK_TAG } from '../sinks/class-sink';
import { ToggleClassSink, TOGGLE_CLASS_SINK_TAG } from '../sinks/class-sink';


// TODO: Maybe Rimmel should be included client side, and the following map should just
// point to the sources and sinks exported from that?

	// const asap = ${String(asap)};
export const HydrationScript = `
<script>
	const resolvables = new Map([...document.querySelectorAll('[RESOLVE]')].map(n=>[n.getAttribute('resolve'), n]));

	const no_sink = (name) => (node, data) => console.error(\`[Rimmel]: called unknown hydration sink "\${name}"\`);
	const sinks = {
		'Attribute': node => data => Object.entries(data).forEach(([k, v]) => {
			k == 'class' ? node.classList.add(v) : node[k] = v;
		}),
		'${APPEND_HTML_SINK_TAG}': ${String(AppendHTMLSink)},
		'${BLUR_SINK_TAG}': ${String(BlurSink)},
		'${CHECKED_SINK_TAG}': ${String(CheckedSink)},
		'${CLOSED_SINK_TAG}': ${String(ClosedSink)},
		'${DISABLED_SINK_TAG}': ${String(DisabledSink)},
		'${FOCUS_SINK_TAG}': ${String(FocusSink)},
		'${INNER_HTML_SINK_TAG}': ${String(InnerHTMLSink)},
		'${INNER_TEXT_SINK_TAG}': ${String(InnerTextSink)},
		'${JSON_DUMP_SINK_TAG}': ${String(JSONDumpSink)},
		'${MIXIN_SINK_TAG}': ${String(AttributeObjectSink)},
		'${PREPEND_HTML_SINK_TAG}': ${String(PrependHTMLSink)},
		'${READ_ONLY_SINK_TAG}': ${String(ReadonlySink)},
		'${REMOVED_SINK_TAG}': ${String(RemovedSink)},
		'${TOGGLE_CLASS_SINK_TAG}': ${String(ToggleClassSink)},
		'xxx_${CLASS_SINK_TAG}': ${String(ClassObjectSink)},
		'xxx_${STYLE_OBJECT_SINK_TAG}': ${String(StyleSink)},
		'class': node => data => Object.entries(data).forEach(([k, v]) => node.classList.toggle(k, v)),
		'style': node => data => Object.entries(data).forEach(([k, v]) => node.style[k] = v),
		'${STYLE_OBJECT_SINK_TAG}': node => data => Object.entries(data).forEach(([k, v]) => node.style[k] = v),
	};

	function Rimmel_Hydrate(data) {
		const [key, conf] = data;
		const node = resolvables.get(key);
		console.log('SINK type', conf.t, conf.value);
		const sinkFn = (sinks[conf.t] ?? no_sink(conf.sink))?.(node);
		sinkFn?.(conf.value);
	}
</script>
`;

