import {
  CompletionItem,
  CompletionItemKind,
  CompletionParams,
} from 'vscode-languageserver/node';
import { BasicCompletion } from './basic-completion';
import { findNodeByPosition } from '../utils/find-element-by-position';
import { documentUriToFsPath } from '../utils/document-uri-to-fs-path';
import { dirname, relative } from 'path';
import { trimTwigExtension } from '../utils/trim-twig-extension';

export class TemplateName extends BasicCompletion {
  async onCompletion(
    completionParams: CompletionParams
  ): Promise<CompletionItem[]> {
    const completions: CompletionItem[] = [];
    const uri = completionParams.textDocument.uri;
    const document = this.server.documentCache.getDocument(uri);
    const cst = await document?.cst();
    const rootNode = cst?.rootNode;

    let node;

    if (rootNode) {
      node = findNodeByPosition(rootNode, completionParams.position);

      if (node) {
        // This case for array or ajax wrapper
        // ['template.html']
        // ajax ? 'ajax.html' : 'not_ajax.html'
        if (
          node.parent?.type === 'array' ||
          node.parent?.type === 'ternary_expression'
        ) {
          node = node.parent;
        }

        if (
          // {% include 'template.html' %}
          (node.parent?.type === 'tag_statement' &&
            node.previousSibling?.type === 'tag' &&
            node.previousSibling?.text === 'include') ||
          // {% include('template.html') %}
          (node.parent?.parent?.parent?.parent?.type === 'function_call' &&
            node.parent?.parent?.parent?.previousSibling?.text === 'include')
        ) {
          const twigPaths = this.server.documentCache.documents.keys();
          const currentPath = dirname(documentUriToFsPath(uri));

          for (const twigPath of twigPaths) {
            completions.push({
              label: relative(
                currentPath,
                documentUriToFsPath(trimTwigExtension(twigPath))
              ),
              kind: CompletionItemKind.File,
            });
          }
        }
      }
    }

    return completions;
  }
}
