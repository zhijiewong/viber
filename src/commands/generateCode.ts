import * as vscode from 'vscode';
import { WebviewProvider } from '../webview/WebviewProvider';
import { Logger } from '../utils/logger';
import { ElementInfo } from '../types';

const logger = new Logger();

export async function generateCodeCommand(webviewProvider: WebviewProvider): Promise<void> {
    try {
        const selectedElement = webviewProvider.getSelectedElement();
        
        if (!selectedElement) {
            vscode.window.showWarningMessage('No element selected. Please select an element first.');
            return;
        }

        logger.info('Generating code for selected element', { 
            tag: selectedElement.tag, 
            selector: selectedElement.cssSelector 
        });

        // Show framework selection
        const framework = await vscode.window.showQuickPick([
            { label: 'React', value: 'react' },
            { label: 'Vue', value: 'vue' },
            { label: 'Angular', value: 'angular' },
            { label: 'Vanilla JS', value: 'vanilla' }
        ], {
            placeHolder: 'Select framework for code generation'
        });

        if (!framework) {
            return;
        }

        // Show generation type
        const generationType = await vscode.window.showQuickPick([
            { label: 'Component', value: 'component', description: 'Generate a component from this element' },
            { label: 'Test', value: 'test', description: 'Generate test code for this element' },
            { label: 'Selector Only', value: 'selector', description: 'Just copy the CSS selector' }
        ], {
            placeHolder: 'What would you like to generate?'
        });

        if (!generationType) {
            return;
        }

        const code = await generateCodeForElement(selectedElement, framework.value, generationType.value);
        
        // Show generated code in a new document
        const document = await vscode.workspace.openTextDocument({
            content: code,
            language: getLanguageForFramework(framework.value)
        });
        
        await vscode.window.showTextDocument(document);
        
        vscode.window.showInformationMessage(`${generationType.label} code generated successfully!`);

    } catch (error) {
        logger.error('Error in generateCode command', error);
        vscode.window.showErrorMessage(`Failed to generate code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

async function generateCodeForElement(element: ElementInfo, framework: string, type: string): Promise<string> {
    switch (type) {
        case 'selector':
            return element.cssSelector;
            
        case 'component':
            return generateComponent(element, framework);
            
        case 'test':
            return generateTest(element, framework);
            
        default:
            return element.cssSelector;
    }
}

function generateComponent(element: ElementInfo, framework: string): string {
    const componentName = generateComponentName(element);
    const props = extractProps(element);
    
    switch (framework) {
        case 'react':
            return generateReactComponent(componentName, element, props);
        case 'vue':
            return generateVueComponent(componentName, element, props);
        case 'angular':
            return generateAngularComponent(componentName, element, props);
        case 'vanilla':
            return generateVanillaComponent(componentName, element);
        default:
            return generateReactComponent(componentName, element, props);
    }
}

function generateTest(element: ElementInfo, _framework: string): string {
    const testName = `${element.tag.toUpperCase()} Element Test`;
    
    return `// Test for element: ${element.cssSelector}
describe('${testName}', () => {
  it('should be present on the page', async () => {
    const element = await page.locator('${element.cssSelector}');
    await expect(element).toBeVisible();
  });

  it('should have correct text content', async () => {
    const element = await page.locator('${element.cssSelector}');
    await expect(element).toHaveText('${element.textContent}');
  });

  it('should be clickable', async () => {
    const element = await page.locator('${element.cssSelector}');
    await element.click();
    // Add assertions for click behavior
  });
});`;
}

function generateComponentName(element: ElementInfo): string {
    if (element.id) {
        return pascalCase(element.id);
    }
    
    if (element.classes.length > 0) {
        return pascalCase(element.classes[0]);
    }
    
    return pascalCase(element.tag + 'Component');
}

function pascalCase(str: string): string {
    return str.replace(/(\w)(\w*)/g, (_g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
              .replace(/[-_\s]/g, '');
}

function extractProps(element: ElementInfo): Record<string, any> {
    const props: Record<string, any> = {};
    
    if (element.textContent) {
        props.children = element.textContent;
    }
    
    // Extract common attributes as props
    ['href', 'src', 'alt', 'title', 'placeholder'].forEach(attr => {
        if (element.attributes[attr]) {
            props[attr] = element.attributes[attr];
        }
    });
    
    return props;
}

function generateReactComponent(name: string, element: ElementInfo, props: Record<string, any>): string {
    const propTypes = Object.keys(props).map(key => `${key}?: string`).join('; ');
    
    return `import React from 'react';

interface ${name}Props {
  ${propTypes}
}

export const ${name}: React.FC<${name}Props> = ({ 
  ${Object.keys(props).join(', ')} 
}) => {
  return (
    <${element.tag}${element.classes.length ? ` className="${element.classes.join(' ')}"` : ''}${element.id ? ` id="${element.id}"` : ''}>
      {children || '${element.textContent}'}
    </${element.tag}>
  );
};

export default ${name};`;
}

function generateVueComponent(name: string, element: ElementInfo, _props: Record<string, any>): string {
    return `<template>
  <${element.tag}${element.classes.length ? ` class="${element.classes.join(' ')}"` : ''}${element.id ? ` id="${element.id}"` : ''}>
    {{ text || '${element.textContent}' }}
  </${element.tag}>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: '${name}',
  props: {
    text: {
      type: String,
      default: '${element.textContent}'
    }
  }
});
</script>`;
}

function generateAngularComponent(name: string, element: ElementInfo, _props: Record<string, any>): string {
    return `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-${name.toLowerCase()}',
  template: \`
    <${element.tag}${element.classes.length ? ` class="${element.classes.join(' ')}"` : ''}${element.id ? ` id="${element.id}"` : ''}>
      {{ text || '${element.textContent}' }}
    </${element.tag}>
  \`
})
export class ${name}Component {
  @Input() text: string = '${element.textContent}';
}`;
}

function generateVanillaComponent(name: string, element: ElementInfo): string {
    return `function create${name}(text = '${element.textContent}') {
  const element = document.createElement('${element.tag}');
  ${element.classes.length ? `element.className = '${element.classes.join(' ')}';` : ''}
  ${element.id ? `element.id = '${element.id}';` : ''}
  element.textContent = text;
  
  return element;
}

// Usage:
// const component = create${name}();
// document.body.appendChild(component);`;
}

function getLanguageForFramework(framework: string): string {
    switch (framework) {
        case 'react':
        case 'angular':
            return 'typescript';
        case 'vue':
            return 'vue';
        case 'vanilla':
            return 'javascript';
        default:
            return 'typescript';
    }
}