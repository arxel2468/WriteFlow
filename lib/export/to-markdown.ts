export type TiptapNode = {
  type: string;
  content?: TiptapNode[];
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string }[];
};

export function tiptapToMarkdown(doc: TiptapNode): string {
  if (!doc.content) return "";
  return doc.content.map((node) => nodeToMd(node)).join("\n");
}



function nodeToMd(node: TiptapNode): string {
  switch (node.type) {
    case "paragraph":
      return inlineContent(node) + "\n";

    case "heading": {
      const level = (node.attrs?.level as number) || 1;
      const prefix = "#".repeat(level);
      return `${prefix} ${inlineContent(node)}\n`;
    }

    case "bulletList":
      return (
        (node.content || [])
          .map((item) => `- ${inlineContent(item.content?.[0] || item)}`)
          .join("\n") + "\n"
      );

    case "orderedList":
      return (
        (node.content || [])
          .map((item, i) => `${i + 1}. ${inlineContent(item.content?.[0] || item)}`)
          .join("\n") + "\n"
      );

    case "blockquote":
      return (
        (node.content || [])
          .map((child) => `> ${inlineContent(child)}`)
          .join("\n") + "\n"
      );

    case "codeBlock":
      return `\`\`\`\n${inlineContent(node)}\n\`\`\`\n`;

    case "horizontalRule":
      return "---\n";

    default:
      return inlineContent(node) + "\n";
  }
}

function inlineContent(node: TiptapNode): string {
  if (node.text) {
    let text = node.text;
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case "bold":
            text = `**${text}**`;
            break;
          case "italic":
            text = `*${text}*`;
            break;
          case "underline":
            text = `<u>${text}</u>`;
            break;
          case "code":
            text = `\`${text}\``;
            break;
          case "strike":
            text = `~~${text}~~`;
            break;
        }
      }
    }
    return text;
  }

  if (node.content) {
    return node.content.map((child) => inlineContent(child)).join("");
  }

  return "";
}