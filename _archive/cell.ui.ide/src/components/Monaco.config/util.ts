export function formatFilename(filename: string) {
  filename = (filename || '').trim().replace(/^ts\:filename\//, '');
  return `ts:filename/${filename}`;
}

export function formatDeclarationContent(content: string) {
  content = content.replace(/export declare /g, 'declare ');
  return content;
}
