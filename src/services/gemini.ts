import { GoogleGenAI } from "@google/genai";
import { SparePart, Message } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
Eres "RepuestosIA", un asistente experto en autopartes y repuestos.
Tu objetivo es ayudar al usuario a encontrar el repuesto exacto que necesita.

Sigue estos pasos:
1. Saluda amigablemente y pregunta qué repuesto busca.
2. Analiza la lista de repuestos proporcionada en el contexto (campos: codigo, descripcion, marca, precio, stock).
3. Si encuentras coincidencias, muéstralas de forma clara mencionando la descripción, marca, referencia o código, precio y disponibilidad (stock).
4. Si el usuario parece interesado en un repuesto específico, incluye un botón de compra usando el formato especial: [COMPRAR:CODIGO] al final de la descripción del producto.
5. Si no encuentras la pieza exacta, ofrece alternativas basadas en la descripción o pide más detalles.
6. Mantén un tono profesional, técnico pero accesible.
7. Si el stock es 0, indica que no hay disponibilidad inmediata.

IMPORTANTE: 
- Responde siempre en español. 
- No inventes repuestos que no estén en la lista.
- El formato [COMPRAR:CODIGO] es vital para que el usuario pueda agregar al carrito desde el chat. Úsalo solo cuando menciones un producto específico que esté disponible.
`;

export async function getAssistantResponse(
  userMessage: string,
  history: Message[],
  availableParts: SparePart[]
) {
  if (!apiKey) {
    return "Error: La API Key de Gemini no está configurada. Por favor, asegúrate de que GEMINI_API_KEY esté en tus secretos.";
  }

  const model = "gemini-3-flash-preview";
  
  // Simple keyword-based filtering to reduce context size
  const searchTerms = userMessage.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const historyTerms = history.slice(-3).flatMap(m => m.text.toLowerCase().split(/\s+/).filter(t => t.length > 2));
  const allTerms = [...new Set([...searchTerms, ...historyTerms])];

  // Common greetings that shouldn't trigger a full inventory search
  const isGreeting = ['hola', 'buenos', 'buenas', 'saludos', 'que tal', 'como estas'].some(g => userMessage.toLowerCase().includes(g)) && searchTerms.length < 3;

  let filteredParts: SparePart[] = [];
  
  if (!isGreeting && allTerms.length > 0) {
    // Priority 1: Match ALL terms from the current message (AND logic)
    const strictMatches = availableParts.filter(p => {
      const content = `${p.descripcion} ${p.marca} ${p.codigo}`.toLowerCase();
      return searchTerms.every(term => content.includes(term));
    });

    if (strictMatches.length > 0) {
      filteredParts = strictMatches;
    } else {
      // Priority 2: Match ANY term if no strict matches found (OR logic)
      const looseMatches = availableParts.filter(p => {
        const content = `${p.descripcion} ${p.marca} ${p.codigo}`.toLowerCase();
        return searchTerms.some(term => content.includes(term));
      });
      if (looseMatches.length > 0) {
        filteredParts = looseMatches;
      }
    }
  }

  // Limit to 40 most relevant parts
  const limitedParts = filteredParts.slice(0, 40);
  
  let partsContext = "";
  if (isGreeting) {
    partsContext = "El usuario está saludando. No muestres productos todavía, solo responde al saludo y pregunta qué necesita.";
  } else if (limitedParts.length > 0) {
    partsContext = `Inventario relevante (${limitedParts.length} items):\n${limitedParts.map(p => `- ${p.descripcion} [Referencia: ${p.codigo}] - Marca: ${p.marca} - Precio: $${p.precio} - Stock: ${p.stock ?? 'N/A'}`).join('\n')}`;
  } else {
    partsContext = "No se encontraron repuestos que coincidan con la búsqueda del usuario en el sistema.";
  }

  const contents = [
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    })),
    {
      role: 'user' as const,
      parts: [{ text: `Contexto de inventario:\n${partsContext}\n\nMensaje del usuario: ${userMessage}` }]
    }
  ];

  try {
    // Increased timeout to 30 seconds for better stability
    const responsePromise = ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Gemini API Timeout")), 30000)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as any;

    return response.text || "Lo siento, tuve un problema al procesar tu solicitud.";
  } catch (error: any) {
    if (error.message === "Gemini API Timeout") {
      return "El asistente está tardando un poco más de lo habitual debido a la gran cantidad de datos. Por favor, intenta ser más específico con el nombre o código del repuesto.";
    }
    console.error("Gemini API Error:", error);
    return "Error de conexión con el asistente.";
  }
}
