// @ts-nocheck - mammoth and pdfjslib are loaded from CDN

/**
 * Parses the content of a File object into a text string.
 * Supports PDF (.pdf) and DOCX (.docx) files.
 * 
 * @param file The file to parse.
 * @returns A promise that resolves with the extracted text content.
 */
export const parseFile = async (file: File): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return parsePdf(file);
  }

  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return parseDocx(file);
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
};

const parsePdf = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error('Failed to read file.'));
      }
      try {
        const pdf = await pdfjsLib.getDocument({ data: event.target.result as ArrayBuffer }).promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
        }
        resolve(textContent);
      } catch (error) {
        reject(new Error(`Error parsing PDF: ${error instanceof Error ? error.message : String(error)}`));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

const parseDocx = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error('Failed to read file.'));
            }
            try {
                const result = await mammoth.extractRawText({ arrayBuffer: event.target.result as ArrayBuffer });
                resolve(result.value);
            } catch (error) {
                reject(new Error(`Error parsing DOCX: ${error instanceof Error ? error.message : String(error)}`));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
