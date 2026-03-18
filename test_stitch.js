const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");

async function run() {
  console.log("Intentando forzar conexión directa a Stitch...");
  
  const transport = new SSEClientTransport(
    new URL("https://stitch.googleapis.com/mcp")
  );
  
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );
  
  try {
    // Configurar los Headers exigidos por Google X-Goog-Api-Key
    console.log("Inyectando API Key: AQ.Ab8RN6LY4SHoJp_NrjxlEG4P2q2y-PA2zxQGCg1vlxP_51ixMw");
    transport.options = {
       headers: {
          "X-Goog-Api-Key": "AQ.Ab8RN6LY4SHoJp_NrjxlEG4P2q2y-PA2zxQGCg1vlxP_51ixMw"
       }
    };

    console.log("Conectando al Transport SSE...");
    await client.connect(transport);
    console.log("✅ Conexión establecida con éxito. Obteniendo herramientas...");
    
    const tools = await client.listTools();
    console.log("Herramientas Stitch encontradas:", tools.tools.map(t => t.name).join(', '));
    
    console.log("🔌 Prueba exitosa. Cerrando canal.");
    await client.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ FALLO MASIVO AL CONECTAR CON STITCH:");
    console.error(err.message);
    process.exit(1);
  }
}

run();
