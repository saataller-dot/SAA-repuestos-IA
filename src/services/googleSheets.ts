import Papa from 'papaparse';
import { SparePart } from '../types';

interface SheetInfo {
  id: string;
  gid: string | null;
  isPub: boolean;
}

function extractSheetInfo(input: string): SheetInfo {
  const info: SheetInfo = { id: input.trim(), gid: null, isPub: false };
  
  if (!input.includes('/')) return info;

  // Extract GID if present (#gid=... or &gid=...)
  const gidMatch = input.match(/[#&]gid=([0-9]+)/);
  if (gidMatch) info.gid = gidMatch[1];

  // Try to extract from "Publish to web" URL: .../d/e/ID/pub...
  const pubMatch = input.match(/\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch && pubMatch[1]) {
    info.id = pubMatch[1];
    info.isPub = true;
    return info;
  }

  // Try to extract from standard URL: .../d/ID/...
  const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    info.id = match[1];
  }

  return info;
}

function getCellValue(row: any, ...possibleKeys: string[]): any {
  const keys = Object.keys(row);
  for (const possibleKey of possibleKeys) {
    const normalizedPossibleKey = possibleKey.toLowerCase().trim();
    const foundKey = keys.find(k => k.toLowerCase().trim() === normalizedPossibleKey);
    if (foundKey) return row[foundKey];
  }
  return null;
}

export async function fetchSpareParts(rawInput: string): Promise<SparePart[]> {
  const trimmedInput = rawInput.trim();
  
  // If no sheet ID or placeholder, return empty array
  if (!trimmedInput || trimmedInput.includes('p_p_p_p')) {
    console.warn('Google Sheet ID is not configured.');
    return [];
  }

  // Construct potential URLs in order of preference
  const urls: string[] = [];
  
  // If it's already a full URL (like a Google Apps Script), use it directly
  if (trimmedInput.startsWith('http')) {
    urls.push(trimmedInput);
  } else {
    const { id, gid, isPub } = extractSheetInfo(trimmedInput);
    if (isPub) {
      urls.push(`https://docs.google.com/spreadsheets/d/e/${id}/pub?output=csv${gid ? `&gid=${gid}` : ''}`);
    } else {
      urls.push(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gid ? `&gid=${gid}` : ''}`);
      urls.push(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : ''}`);
    }
  }

  for (const url of urls) {
    try {
      console.log(`Attempting to fetch sheet from: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const textData = await response.text();
        
        // Try to parse as JSON first, regardless of content-type header
        // (Apps Script sometimes returns text/plain or text/javascript)
        try {
          const jsonData = JSON.parse(textData);
          if (Array.isArray(jsonData)) {
            const parts: SparePart[] = jsonData.map((row: any, index: number) => {
              const codigo = getCellValue(row, 'Codigo', 'codigo', 'cod', 'id', 'referencia') || `ID-${index}`;
              const descripcion = getCellValue(row, 'Repuesto', 'descripcion', 'nombre', 'articulo', 'pieza', 'name') || 'Sin descripción';
              let fotos = getCellValue(row, 'image', 'fotos', 'foto', 'imagen', 'url', 'link', 'imageUrl');
              if (!fotos || String(fotos).trim() === '') {
                fotos = `https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&h=300&auto=format&fit=crop`;
              }
              const marca = getCellValue(row, 'Marca', 'marca', 'fabricante', 'brand', 'category') || 'Genérico';
              const precioRaw = getCellValue(row, 'price', 'precio', 'valor', 'costo');
              const precio = parseFloat(String(precioRaw || 0).replace(/[^0-9.-]+/g,"")) || 0;
              const stockRaw = getCellValue(row, 'stock', 'cantidad', 'existencia');
              const stock = parseInt(String(stockRaw || 0).replace(/[^0-9]+/g,"")) || 0;
              
              return { codigo, descripcion, fotos, marca, precio, stock };
            });
            console.log(`Successfully loaded ${parts.length} parts from JSON API.`);
            return parts;
          }
        } catch (e) {
          // Not JSON, continue to CSV parsing
        }

        const csvData = textData;
        
        // If the response is HTML, it's likely a login page (sheet is private)
        if (csvData.trim().toLowerCase().startsWith('<!doctype html') || csvData.includes('<html')) {
          console.error('The sheet appears to be private. Please set access to "Anyone with the link".');
          continue; // Try next URL
        }

        if (csvData && csvData.length > 10) {
          return new Promise((resolve) => {
            Papa.parse(csvData, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                if (!results.data || results.data.length === 0) {
                  console.warn('No data found in the sheet.');
                  resolve([]);
                  return;
                }

                const parts: SparePart[] = results.data.map((row: any, index: number) => {
                  const codigo = getCellValue(row, 'Codigo', 'codigo', 'cod', 'id', 'referencia') || `ID-${index}`;
                  const descripcion = getCellValue(row, 'Repuesto', 'descripcion', 'nombre', 'articulo', 'pieza', 'name') || 'Sin descripción';
                  
                  // Handle missing or empty photo field
                  let fotos = getCellValue(row, 'image', 'fotos', 'foto', 'imagen', 'url', 'link', 'imageUrl');
                  if (!fotos || String(fotos).trim() === '') {
                    fotos = `https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&h=300&auto=format&fit=crop`; // High quality auto parts placeholder
                  }

                  const marca = getCellValue(row, 'Marca', 'marca', 'fabricante', 'brand', 'category') || 'Genérico';
                  const precioRaw = getCellValue(row, 'price', 'precio', 'valor', 'costo');
                  const precio = parseFloat(String(precioRaw || 0).replace(/[^0-9.-]+/g,"")) || 0;
                  const stockRaw = getCellValue(row, 'stock', 'cantidad', 'existencia');
                  const stock = parseInt(String(stockRaw || 0).replace(/[^0-9]+/g,"")) || 0;

                  return { codigo, descripcion, fotos, marca, precio, stock };
                });
                
                console.log(`Successfully loaded ${parts.length} parts.`);
                resolve(parts);
              },
              error: (error: any) => {
                console.error('CSV Parse Error:', error);
                resolve([]);
              },
            });
          });
        }
      } else {
        console.warn(`Failed fetch for ${url}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
    }
  }

  console.error('All fetch attempts failed.');
  return [];
}
