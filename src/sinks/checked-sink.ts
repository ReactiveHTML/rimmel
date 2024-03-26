export const CheckedSink = (node: HTMLInputElement) =>
    (checked: unknown) => {
        node.checked = !!checked
    };
