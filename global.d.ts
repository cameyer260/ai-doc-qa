// global.d.ts
declare module "pdf-parse/lib/pdf-parse.js" {
  /**
   * Minimal type for the implementation we call.
   * The real lib returns an object with "text" and more fields,
   * but we only need "text" here.
   */
  const pdfParse: (data: Buffer) => Promise<{ text: string }>;
  export default pdfParse;
}
