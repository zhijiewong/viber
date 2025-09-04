// Type declarations for external modules without official types

declare module 'unique-selector' {
    function unique(element: Element, options?: {
        selectorTypes?: string[];
        attributesToIgnore?: string[];
        excludeRegex?: RegExp;
    }): string;
    export = unique;
}

declare module 'xpath' {
    export function select(expression: string, node: Node, single?: boolean): Node[] | Node | string[] | string | number | boolean;
    export function select1(expression: string, node: Node): Node | null;
}
