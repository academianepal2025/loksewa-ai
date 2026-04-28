import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const base64Data = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQMzY2MFQz1jBQMdQwMlIprSqtKFcryc1P1SwoT0/Ly0yv1S4DqYJqUahXyE0sUMvNzQYLc0pS8xNzUvBIFVyA/sTjVv7Q0L0/BOSOxOJWQK0D6U6FCpTkF+bnxSZn5efEAhSckvwplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjY5CmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NS4yOCA4NDEuODldL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSA0IDAgUj4+Pj4vQ29udGVudHMgMiAwIFIvUGFyZW50IDUgMCBSPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYT4+CmVuZG9iagoKNSAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sxIDAgUl0+PgplbmRvYmoKCjYgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDUgMCBSPj4KZW5kb2JqCgp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAxNDYgMDAwMDAgbiAKMDAwMDAwMDAxOSAwMDAwMCBuIAowMDAwMDAwMTI2IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMzMyAwMDAwMCBuIAowMDAwMDAwMzkyIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgNiAwIFI+PgpzdGFydHhyZWYKNDQxCiUlRU9GCg==";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a test assistant.",
        temperature: 0.7
      },
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: base64Data, mimeType: 'application/pdf' } }
          ]
        }
      ]
    });
    console.log("SUCCESS:", response.text);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
run();
