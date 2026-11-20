import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareDocumentUpload } from './resourceUpload.ts';

test('prepareDocumentUpload stores a document metadata payload with a data URL', async () => {
  const file = new File(['hello world'], 'notes.txt', { type: 'text/plain' });

  const result = await prepareDocumentUpload(file);

  assert.equal(result.fileName, 'notes.txt');
  assert.equal(result.fileType, 'text/plain');
  assert.ok(result.fileUrl.startsWith('data:text/plain'));
  assert.equal(result.fileSize, file.size);
});
