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

declare module 'html-minifier-terser' {
    export interface Options {
        removeComments?: boolean;
        removeCommentsFromCDATA?: boolean;
        removeCDATASectionsFromCDATA?: boolean;
        collapseWhitespace?: boolean;
        conservativeCollapse?: boolean;
        removeAttributeQuotes?: boolean;
        useShortDoctype?: boolean;
        removeEmptyAttributes?: boolean;
        removeScriptTypeAttributes?: boolean;
        removeStyleLinkTypeAttributes?: boolean;
        keepClosingSlash?: boolean;
        minifyJS?: boolean;
        minifyCSS?: boolean;
        minifyURLs?: boolean;
        sortAttributes?: boolean;
        sortClassName?: boolean;
        removeEmptyElements?: boolean;
        trimCustomFragments?: boolean;
        ignoreCustomFragments?: RegExp[];
    }
    
    export function minify(text: string, options?: Options): Promise<string>;
}

declare module 'js-beautify' {
    export interface HTMLOptions {
        indent_size?: number;
        indent_char?: string;
        max_preserve_newlines?: number;
        preserve_newlines?: boolean;
        keep_array_indentation?: boolean;
        break_chained_methods?: boolean;
        indent_scripts?: string;
        brace_style?: string;
        space_before_conditional?: boolean;
        unescape_strings?: boolean;
        jslint_happy?: boolean;
        end_with_newline?: boolean;
        wrap_line_length?: number;
        indent_inner_html?: boolean;
        comma_first?: boolean;
        e4x?: boolean;
        indent_empty_lines?: boolean;
    }
    
    export function html(text: string, options?: HTMLOptions): string;
}