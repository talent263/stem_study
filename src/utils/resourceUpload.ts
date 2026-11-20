export interface DocumentUpload {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
}

export async function prepareDocumentUpload(file: File): Promise<DocumentUpload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';

      resolve({
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        fileUrl: result,
      });
    };

    reader.onerror = () => {
      reject(new Error(`Unable to read file: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}
