import "dotenv/config";
import { db } from "../backend/db";
import { errorTypes } from "../shared/schema";

const errorTypesData = [
  {
    "errorId": "black-screen",
    "title": "Bleibt schwarz",
    "description": "Display zeigt kein Bild an",
    "iconName": "Monitor",
    "isActive": true,
    "videoUrl": "https://example.com/black-screen-fix.mp4",
    "instructions": "1. Überprüfen Sie alle Kabelverbindungen\n2. Starten Sie das Gerät neu\n3. Warten Sie 30 Sekunden nach dem Einschalten\n4. Prüfen Sie die Helligkeit-Einstellungen\n5. Testen Sie mit einem anderen Eingangssignal",
    "videoEnabled": false,
    "category": "hardware"
  },
  {
    "errorId": "lines",
    "title": "Linien im Bild",
    "description": "Störende Linien oder Streifen",
    "iconName": "BarChart3",
    "isActive": true,
    "videoUrl": null,
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": false,
    "category": "hardware"
  },
  {
    "errorId": "freeze",
    "title": "Hängt nach Neustart",
    "description": "Display reagiert nicht mehr",
    "iconName": "PauseCircle",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.test",
    "videoEnabled": false,
    "category": "software"
  },
  {
    "errorId": "no-connection",
    "title": "Keine Verbindung",
    "description": "Signal wird nicht erkannt",
    "iconName": "Unlink",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": false,
    "category": "network"
  },
  {
    "errorId": "bootloop-hang",
    "title": "Display bleibt im Bootloop hängen (ESYSYNC Logo)",
    "description": "Display startet immer wieder neu und zeigt nur das ESYSYNC Logo",
    "iconName": "RotateCcw",
    "isActive": true,
    "videoUrl": "https://youtu.be/uLx8zV649X0?si=lg2i0JcaNPkoLPwn",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": false,
    "category": "hardware"
  },
  {
    "errorId": "app-not-starting",
    "title": "Display startet die APP nicht, Blonde Frau",
    "description": "App startet nicht und zeigt stattdessen eine blonde Frau",
    "iconName": "AlertTriangle",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": false,
    "category": "hardware"
  },
  {
    "errorId": "no-content-assigned",
    "title": "No Content Assigned",
    "description": "Display zeigt \"No Content Assigned\" Meldung",
    "iconName": "FileX",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": false,
    "category": "hardware"
  },
  {
    "errorId": "black-homeapp-selection",
    "title": "Display schwarz und Homeapp muss ausgewählt werden",
    "description": "Display ist schwarz und die Home-App muss manuell ausgewählt werden",
    "iconName": "Settings",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": false,
    "category": "hardware"
  },
  {
    "errorId": "no-connection-red-indicator",
    "title": "Display updatet nicht, hat keine Verbindung (rotes Ausrufezeichen)",
    "description": "Inhalt wird angezeigt, aber rotes Ausrufezeichen in der ESYSYNC APP",
    "iconName": "WifiOff",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": false,
    "category": "hardware"
  },
  {
    "errorId": "panel-damage",
    "title": "Displaypanel hat einen Schaden (Sprung, Bruch, Anzeigeschaden)",
    "description": "Physische Schäden am Display-Panel wie Risse oder Brüche",
    "iconName": "ShieldAlert",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": false,
    "category": "hardware"
  },
  {
    "errorId": "housing-damage",
    "title": "Displaygehäuse beschädigt (Sturz, Bruch, sonstige Acrylbeschädigung)",
    "description": "Gehäuse ist beschädigt durch Sturz oder andere Einwirkungen",
    "iconName": "Package",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": false,
    "category": "hardware"
  },
  {
    "errorId": "led-defect",
    "title": "Displaypanel hat defekte Ledbeleuchtung",
    "description": "LED-Hintergrundbeleuchtung funktioniert nicht ordnungsgemäß",
    "iconName": "Lightbulb",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": true,
    "category": "hardware"
  },
  {
    "errorId": "panel-flickering",
    "title": "Displaypanel flackert",
    "description": "Display zeigt Flackern oder unstabile Bilddarstellung",
    "iconName": "Zap",
    "isActive": true,
    "videoUrl": "",
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": true,
    "category": "hardware"
  },
  {
    "errorId": "voltage-conversion",
    "title": "Display soll auf 24 Volt umgerüstet werden",
    "description": "Umbau des Displays für 24V Betriebsspannung",
    "iconName": "Battery",
    "isActive": true,
    "videoUrl": null,
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": true,
    "category": "hardware"
  },
  {
    "errorId": "sim-card-error",
    "title": "Display zeigt Fehler: \"Simkarte entfernen\"",
    "description": "Fehlermeldung bezüglich der SIM-Karte",
    "iconName": "Smartphone",
    "isActive": true,
    "videoUrl": null,
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": true,
    "category": "hardware"
  },
  {
    "errorId": "android-auth-error",
    "title": "Display zeigt Fehler: \"Android UI Authentication Error\"",
    "description": "Android Authentifizierungsfehler wird angezeigt",
    "iconName": "Shield",
    "isActive": true,
    "videoUrl": null,
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": true,
    "category": "hardware"
  },
  {
    "errorId": "no-power",
    "title": "Alle Displays bekommen keinen Strom",
    "description": "Stromversorgungsproblem für mehrere Displays",
    "iconName": "Power",
    "isActive": true,
    "videoUrl": null,
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": true,
    "category": "hardware"
  },
  {
    "errorId": "router-defect",
    "title": "Router ist defekt",
    "description": "Netzwerk-Router funktioniert nicht mehr",
    "iconName": "Router",
    "isActive": true,
    "videoUrl": null,
    "instructions": "Kontaktieren Sie den technischen Support für weitere Hilfe bei diesem Problem.",
    "videoEnabled": true,
    "category": "network"
  }
];

async function main() {
  console.log("Clearing existing error types...");
  await db.delete(errorTypes);

  console.log("Importing error types...");
  for (const errorData of errorTypesData) {
    await db.insert(errorTypes).values(errorData);
    console.log(`  Imported: ${errorData.title}`);
  }

  console.log(`Done! Imported ${errorTypesData.length} error types.`);
  process.exit(0);
}

main().catch(console.error);
