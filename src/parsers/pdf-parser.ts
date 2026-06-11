import { execFile } from 'child_process';
import * as path from 'path';

export interface PdfParseResult {
  success: boolean;
  text?: string;
  page_count?: number;
  error?: string;
}

export async function parsePdf(filePath: string): Promise<PdfParseResult> {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, 'pdf.py');
    
    // Execute python, passing the script and the target file path
    execFile('python', [pythonScript, filePath], (error, stdout, stderr) => {
      if (error && !stdout) {
        return resolve({
          success: false,
          error: `Failed to execute python script: ${error.message}. stderr: ${stderr}`
        });
      }
      
      try {
        const result = JSON.parse(stdout.trim()) as PdfParseResult;
        resolve(result);
      } catch (parseError) {
        resolve({
          success: false,
          error: `Failed to parse Python script output: ${(parseError as Error).message}. Output: ${stdout}`
        });
      }
    });
  });
}
