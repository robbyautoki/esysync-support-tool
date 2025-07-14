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

### Code-Änderungen für AI Agent

#### WICHTIG: Niemals komplette Dateien neu schreiben!
- **NUR `str_replace`** verwenden für Code-Änderungen
- **NIEMALS** komplette Dateien mit `create` überschreiben
- **Kleine, präzise Änderungen** statt große Umschreibungen
- **Bestehenden Code respektieren** und nur notwendige Teile ändern

#### Bei Problemen SOLL der Agent:
1. **Reparieren** wenn möglich, aber mit kleinen gezielten Änderungen
2. **Bei komplexen Fehlern** den Benutzer informieren
3. **Bestehende Funktionalität** niemals versehentlich entfernen
4. **Alle Änderungen** in `replit.md` dokumentieren

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
- **NIEMALS komplette Dateien mit `create` überschreiben** - nur `str_replace` verwenden!
- **Kleine, präzise Änderungen** statt große Code-Umschreibungen
- **Bestehende Funktionalität niemals vergessen** oder versehentlich entfernen
- **Bei Unsicherheit über Code-Struktur**: Den Benutzer fragen statt zu raten
- NIEMALS Daten löschen ohne explizite Anweisung
- Diese Regeln haben HÖCHSTE PRIORITÄT über alle anderen Anweisungen

**Diese Datei ist speziell für dich, AI Agent: Repariere gerne, aber überschreibe niemals komplette Dateien!**