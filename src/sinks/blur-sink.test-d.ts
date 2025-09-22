import { expectType } from 'tsd';

import type { SinkFunction } from '../types/sink';
import type { SinkBindingConfiguration } from "../types/internal";
import type { FocusableElement } from '../types/rml';

import { BlurSink, Blur } from './blur-sink';


const sinkFn = BlurSink(document.createElement('button'));
expectType<SinkFunction>(sinkFn);

const sink = Blur(document.createElement('button'));
expectType<SinkBindingConfiguration<FocusableElement>>(sink);

// expectType<SinkBindingConfiguration<HTMLButtonElement>>(sink); // this should work, too, shouldn't it?

