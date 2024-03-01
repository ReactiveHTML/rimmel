import { Sink } from "../types/sink";

export const errorSink: Sink = () => () => void console.error;