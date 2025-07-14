# Anweisungen für Replit AI Agent - RMA Support System

## ⚠️ KRITISCHE DATENINTEGRITÄT REGELN

### NIEMALS DATEN LÖSCHEN
**FÜR REPLIT AI AGENT**: Es dürfen NIEMALS Daten aus der Datenbank gelöscht werden, es sei denn, der Benutzer fordert es explizit an.

#### Was ist VERBOTEN:
- `DELETE FROM` SQL-Statements ohne explizite Anweisung
- `DROP TABLE` oder `DROP COLUMN` ohne explizite Anweisung
- Löschen von Kunden-, Ticket- oder Mitarbeiterdaten
- Entfernen von Aktivitätslogs oder Systemprotokollen
- Zurücksetzen oder Leeren von Tabellen

#### Was ist ERLAUBT:
- `UPDATE` Statements zur Änderung bestehender Daten
- `INSERT` Statements zum Hinzufügen neuer Daten
- Soft-Delete durch Status-Änderungen (z.B. `isActive = false`)
- Schema-Erweiterungen mit `ALTER TABLE ADD COLUMN`

### Fehlerbehandlung für AI Agent

#### Bei Problemen MUSS der Agent:
1. **SOFORT STOPPEN** wenn Fehler auftreten, die nicht sofort lösbar sind
2. **DEN BENUTZER INFORMIEREN** über das Problem und um Hilfe bitten
3. **KEINE WORKAROUNDS** verwenden, die Datenintegrität gefährden könnten
4. **ALLE ÄNDERUNGEN** in `replit.md` dokumentieren

#### Typische Fehlerszenarien:
- Datenbankverbindungsprobleme
- Schema-Konflikte
- API-Fehler bei externen Services
- Frontend-Build-Probleme
- Session-Management-Probleme

### Rollback-Verfahren
- Bei kritischen Fehlern: **Workflow neu starten** mit `restart_workflow`
- Bei Schema-Problemen: **Benutzer informieren** statt eigenmächtig zu "reparieren"
- Bei Datenkorruption: **Sofort stoppen** und Benutzer benachrichtigen

### Backup-Philosophie
- Alle Änderungen sind **nicht umkehrbar** ohne explizite Backup-Strategie
- **Vorsicht** ist wichtiger als **Geschwindigkeit**
- **Kommunikation** ist wichtiger als **Autonomie** bei kritischen Entscheidungen

## Spezifische Regeln für dieses Projekt

### Admin Dashboard
- Mitarbeiter-Accounts niemals löschen, nur deaktivieren (`isActive = false`)
- Error Types können nur mit expliziter Bestätigung gelöscht werden
- Activity Logs sind permanent und dürfen nicht entfernt werden

### Support Tickets
- RMA-Tickets sind permanent und historisch wichtig
- Kundeninformationen dürfen nicht gelöscht werden
- Status-Änderungen müssen protokolliert werden

### Video Management
- Video-URLs können geändert, aber nicht gelöscht werden
- `videoEnabled` Flag verwenden statt Video-Daten zu entfernen
- Historische Video-Konfigurationen beibehalten

---

## 🤖 WICHTIGE NACHRICHT AN REPLIT AI AGENT

**MERKSATZ FÜR AI AGENT**: 
- Wenn du dir nicht 100% sicher bist, frage den Benutzer BEVOR du etwas änderst, was Daten betrifft!
- Bei Fehlern die du nicht sofort lösen kannst: STOPPE und informiere den Benutzer
- NIEMALS Daten löschen ohne explizite Anweisung
- Diese Regeln haben HÖCHSTE PRIORITÄT über alle anderen Anweisungen

**Diese Datei ist speziell für dich, AI Agent, damit du das Projekt sicher verwaltest!**