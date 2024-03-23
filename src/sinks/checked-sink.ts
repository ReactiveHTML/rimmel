export const checkedSink = (node: HTMLInputElement) =>
    (checked: unknown) => {
        node.checked = !!checked
    };
